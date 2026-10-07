"""SimpleWeather: readable Korean weather app for Windows."""

from __future__ import annotations

import sys
from datetime import datetime, timezone, timedelta
from typing import Any, Callable
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from PySide6.QtCore import QObject, QRunnable, QThreadPool, Qt, Signal, Slot
from PySide6.QtGui import QFont
from PySide6.QtWidgets import (
    QApplication,
    QComboBox,
    QDialog,
    QDialogButtonBox,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from weather_api import City, OpenWeather, WeatherApiError, load_api_key, save_api_key

STYLE = """
QWidget { color: #15324b; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 18px; }
QMainWindow, QScrollArea, QScrollArea > QWidget > QWidget { background: #eef7fc; }
QFrame#hero { background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #0b5b91, stop:1 #178bc1); border-radius: 24px; }
QFrame#hero QLabel { color: white; }
QFrame.card { background: white; border: 1px solid #d4e6f0; border-radius: 18px; }
QLabel#sectionTitle { color: #123d5c; font-size: 22px; font-weight: 700; }
QLabel#mainTemp { font-size: 64px; font-weight: 700; }
QLabel#condition { font-size: 24px; font-weight: 600; }
QLabel#cityTitle { font-size: 29px; font-weight: 700; }
QLabel#muted { color: #45647a; }
QLineEdit, QComboBox { background: white; border: 2px solid #b7d4e4; border-radius: 12px; padding: 10px 12px; min-height: 30px; }
QLineEdit:focus, QComboBox:focus { border-color: #087bb5; }
QPushButton { background: #075d91; color: white; border: 0; border-radius: 12px; padding: 11px 20px; font-weight: 700; min-height: 30px; }
QPushButton:hover { background: #064d78; }
QPushButton:disabled { background: #87a7b9; }
QPushButton#secondary { background: #dcedf6; color: #124663; }
QPushButton#secondary:hover { background: #c9e2ef; }
QLabel#alertTitle { color: #7b2e0a; font-weight: 700; }
QFrame#alertCard { background: #fff4e8; border: 1px solid #f1c79f; border-radius: 14px; }
QFrame#forecastItem { background: #f4faff; border: 1px solid #dceaf2; border-radius: 14px; }
"""


class WorkerSignals(QObject):
    result = Signal(object)
    error = Signal(str)
    finished = Signal()


class Worker(QRunnable):
    def __init__(self, task: Callable[[], Any]):
        super().__init__()
        self.task = task
        self.signals = WorkerSignals()

    @Slot()
    def run(self) -> None:
        try:
            self.signals.result.emit(self.task())
        except WeatherApiError as exc:
            self.signals.error.emit(str(exc))
        except Exception as exc:  # keep unexpected response issues out of the GUI thread
            self.signals.error.emit(f"처리 중 문제가 생겼어요: {exc}")
        finally:
            self.signals.finished.emit()


def card() -> QFrame:
    frame = QFrame()
    frame.setProperty("class", "card")
    frame.setStyleSheet("QFrame { background: white; border: 1px solid #d4e6f0; border-radius: 18px; }")
    return frame


def section_label(text: str) -> QLabel:
    label = QLabel(text)
    label.setObjectName("sectionTitle")
    return label


def format_time(timestamp: int, timezone_name: str, offset: int, fmt: str) -> str:
    try:
        dt = datetime.fromtimestamp(timestamp, ZoneInfo(timezone_name))
    except (ZoneInfoNotFoundError, ValueError, TypeError):
        dt = datetime.fromtimestamp(timestamp, timezone.utc).astimezone(timezone(timedelta(seconds=offset)))
    return dt.strftime(fmt)


def weather_emoji(item: dict[str, Any]) -> str:
    code = int(item.get("id", 0) or 0)
    if 200 <= code < 300:
        return "⛈️"
    if 300 <= code < 600:
        return "🌧️"
    if 600 <= code < 700:
        return "❄️"
    if 700 <= code < 800:
        return "🌫️"
    if code == 800:
        return "☀️" if str(item.get("icon", "")).endswith("d") else "🌙"
    if code > 800:
        return "☁️"
    return "🌤️"


class KeyDialog(QDialog):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)
        self.setWindowTitle("OpenWeather API 키 설정")
        self.setMinimumWidth(520)
        layout = QVBoxLayout(self)
        note = QLabel("OpenWeather API 키를 입력해 주세요. 키는 이 PC의 사용자 설정에 저장됩니다.")
        note.setWordWrap(True)
        note.setObjectName("muted")
        layout.addWidget(note)
        self.key_input = QLineEdit(load_api_key())
        self.key_input.setPlaceholderText("새 API 키")
        self.key_input.setEchoMode(QLineEdit.EchoMode.Password)
        layout.addWidget(self.key_input)
        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Save | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)

    def accept(self) -> None:
        key = self.key_input.text().strip()
        if not key:
            QMessageBox.warning(self, "API 키 필요", "API 키를 입력해 주세요.")
            return
        save_api_key(key)
        super().accept()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("SimpleWeather · 오늘의 날씨")
        self.resize(1120, 900)
        self.setMinimumSize(760, 650)
        self.pool = QThreadPool.globalInstance()
        self._workers: set[Worker] = set()
        self.pending_cities: list[City] = []
        self.active_city: City | None = None
        self._build_ui()
        if not load_api_key():
            self.open_key_settings(first_run=True)

    def _build_ui(self) -> None:
        root = QWidget()
        outer = QVBoxLayout(root)
        outer.setContentsMargins(20, 16, 20, 20)
        outer.setSpacing(14)

        top = QHBoxLayout()
        brand = QLabel("☀  SIMPLE WEATHER")
        brand.setStyleSheet("font-size: 20px; font-weight: 800; color: #075d91;")
        top.addWidget(brand)
        top.addStretch(1)
        self.settings_button = QPushButton("⚙  API 키 설정")
        self.settings_button.setObjectName("secondary")
        self.settings_button.clicked.connect(self.open_key_settings)
        top.addWidget(self.settings_button)
        outer.addLayout(top)

        search = QHBoxLayout()
        self.city_input = QLineEdit()
        self.city_input.setPlaceholderText("주소를 입력하세요 (시·구·동·리 가능)  예: 서울, 명지, 역삼동")
        self.city_input.returnPressed.connect(self.search_city)
        self.search_button = QPushButton("도시 검색")
        self.search_button.clicked.connect(self.search_city)
        search.addWidget(self.city_input, 1)
        search.addWidget(self.search_button)
        outer.addLayout(search)

        self.city_picker = QComboBox()
        self.city_picker.setVisible(False)
        self.city_picker.activated.connect(self.city_selected)
        outer.addWidget(self.city_picker)
        address_credit = QLabel("동 단위 행정구역 자료: © OpenStreetMap contributors")
        address_credit.setObjectName("muted")
        address_credit.setStyleSheet("font-size: 11px;")
        outer.addWidget(address_credit)

        self.status = QLabel("도시를 검색해 현재 날씨와 예보를 확인해 보세요.")
        self.status.setObjectName("muted")
        self.status.setWordWrap(True)
        outer.addWidget(self.status)

        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.content = QWidget()
        self.content_layout = QVBoxLayout(self.content)
        self.content_layout.setContentsMargins(2, 2, 8, 2)
        self.content_layout.setSpacing(14)
        self.scroll.setWidget(self.content)
        outer.addWidget(self.scroll, 1)
        self.setCentralWidget(root)

    def _set_busy(self, busy: bool, message: str = "") -> None:
        self.search_button.setEnabled(not busy)
        self.city_input.setEnabled(not busy)
        self.status.setText(message)

    def _api(self) -> OpenWeather:
        key = load_api_key()
        if not key:
            raise WeatherApiError("API 키를 먼저 설정해 주세요.")
        return OpenWeather(key)

    def _run_worker(self, task: Callable[[], Any], success: Callable[[Any], None], error_message: str = "") -> None:
        worker = Worker(task)
        self._workers.add(worker)
        worker.signals.result.connect(success)
        worker.signals.error.connect(lambda message: self._handle_error(message, error_message))
        worker.signals.finished.connect(lambda worker=worker: self._workers.discard(worker))
        self.pool.start(worker)

    def search_city(self) -> None:
        query = self.city_input.text().strip()
        if not query:
            self.status.setText("먼저 도시 이름을 입력해 주세요.")
            return
        try:
            api = self._api()
        except WeatherApiError as exc:
            self._handle_error(str(exc))
            return
        self.city_picker.setVisible(False)
        self._set_busy(True, f"‘{query}’ 위치를 찾고 있어요…")
        self._run_worker(lambda: api.search_cities(query), self._cities_found)

    @Slot(object)
    def _cities_found(self, cities: list[City]) -> None:
        self._set_busy(False)
        self.pending_cities = cities
        if not cities:
            self.status.setText("도시를 찾지 못했어요. 한글 또는 영문 이름으로 다시 검색해 주세요.")
            return
        if len(cities) == 1:
            self.load_city(cities[0])
            return
        self.city_picker.blockSignals(True)
        self.city_picker.clear()
        self.city_picker.addItems([city.label for city in cities])
        self.city_picker.blockSignals(False)
        self.city_picker.setVisible(True)
        self.status.setText("같은 이름의 도시가 있어요. 원하는 위치를 선택해 주세요.")

    @Slot(int)
    def city_selected(self, index: int) -> None:
        if 0 <= index < len(self.pending_cities) and self.city_picker.isVisible():
            self.load_city(self.pending_cities[index])

    def load_city(self, city: City) -> None:
        self.active_city = city
        self._set_busy(True, f"{city.label} 날씨를 불러오고 있어요…")
        try:
            api = self._api()
        except WeatherApiError as exc:
            self._handle_error(str(exc))
            return
        self._run_worker(lambda: api.get_weather(city), lambda payload: self._render_weather(city, payload))

    @Slot(str)
    def _handle_error(self, message: str, prefix: str = "") -> None:
        self._set_busy(False)
        self.status.setText(f"{prefix}{message}" if prefix else message)

    def open_key_settings(self, first_run: bool = False) -> None:
        dialog = KeyDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.status.setText("API 키를 저장했어요. 도시를 검색해 보세요.")
        elif first_run and not load_api_key():
            self.status.setText("날씨 조회를 위해 API 키를 설정해 주세요.")

    def _clear_weather(self) -> None:
        while self.content_layout.count():
            item = self.content_layout.takeAt(0)
            widget = item.widget()
            if widget is not None:
                widget.deleteLater()

    def _render_weather(self, city: City, payload: dict[str, Any]) -> None:
        self._set_busy(False, f"{city.label} · 최신 날씨 정보")
        self._clear_weather()
        current = payload.get("current", {})
        weather = (current.get("weather") or [{}])[0]
        timezone_name = ""
        offset = int(current.get("timezone", 0) or 0)
        forecast_records = payload.get("forecast", {}).get("list", [])
        current_main = current.get("main") or {}

        hero = QFrame()
        hero.setObjectName("hero")
        hero_layout = QVBoxLayout(hero)
        hero_layout.setContentsMargins(28, 24, 28, 24)
        hero_layout.setSpacing(8)
        city_label = QLabel(city.label)
        city_label.setObjectName("cityTitle")
        hero_layout.addWidget(city_label)
        stamp = QLabel(format_time(int(current.get("dt", 0)), timezone_name, offset, "%Y년 %m월 %d일 · %H:%M 기준"))
        stamp.setStyleSheet("color: #e5f6ff; font-size: 16px;")
        hero_layout.addWidget(stamp)
        main_row = QHBoxLayout()
        emoji = QLabel(weather_emoji(weather))
        emoji.setStyleSheet("font-size: 60px;")
        temp = QLabel(f"{round(float(current_main.get('temp', 0)))}°")
        temp.setObjectName("mainTemp")
        summary = QVBoxLayout()
        desc = QLabel(weather.get("description", "날씨 정보"))
        desc.setObjectName("condition")
        feels = QLabel(f"체감 {round(float(current_main.get('feels_like', current_main.get('temp', 0))))}°C")
        feels.setStyleSheet("color: #e5f6ff;")
        summary.addWidget(desc)
        summary.addWidget(feels)
        main_row.addWidget(emoji)
        main_row.addWidget(temp)
        main_row.addSpacing(20)
        main_row.addLayout(summary)
        main_row.addStretch(1)
        hero_layout.addLayout(main_row)
        self.content_layout.addWidget(hero)

        metrics = card()
        metrics_grid = QGridLayout(metrics)
        metrics_grid.setContentsMargins(20, 18, 20, 18)
        metrics_grid.setHorizontalSpacing(14)
        metrics_grid.setVerticalSpacing(14)
        rain = current.get("rain") or {}
        snow = current.get("snow") or {}
        precipitation = float(rain.get("1h", 0) or 0) + float(snow.get("1h", 0) or 0)
        wind = current.get("wind") or {}
        clouds = current.get("clouds") or {}
        system = current.get("sys") or {}
        metric_values = [
            ("습도", f"{current_main.get('humidity', '—')}%"),
            ("바람", f"{float(wind.get('speed', 0)):.1f} m/s"),
            ("기압", f"{current_main.get('pressure', '—')} hPa"),
            ("최근 강수", f"{precipitation:.1f} mm/h"),
            ("가시거리", f"{float(current.get('visibility', 0)) / 1000:.1f} km"),
            ("구름", f"{clouds.get('all', '—')}%"),
            ("일출", format_optional(system.get("sunrise"), timezone_name, offset)),
            ("일몰", format_optional(system.get("sunset"), timezone_name, offset)),
        ]
        for i, (title, value) in enumerate(metric_values):
            box = QWidget()
            box_layout = QVBoxLayout(box)
            box_layout.setContentsMargins(4, 2, 4, 2)
            caption = QLabel(title)
            caption.setObjectName("muted")
            value_label = QLabel(value)
            value_label.setStyleSheet("font-size: 21px; font-weight: 700;")
            box_layout.addWidget(caption)
            box_layout.addWidget(value_label)
            metrics_grid.addWidget(box, i // 4, i % 4)
        self.content_layout.addWidget(metrics)

        availability = QLabel("무료 예보: 3시간 간격 · 5일  |  자외선 지수와 공식 기상특보는 포함되지 않아요.")
        availability.setObjectName("muted")
        availability.setWordWrap(True)
        self.content_layout.addWidget(availability)
        self._render_forecast("3시간 간격 예보 · 5일", forecast_records, timezone_name, offset, hourly=True)
        self._render_daily(self._daily_summaries(forecast_records, offset), timezone_name, offset)

    def _render_forecast(self, title: str, records: list[dict[str, Any]], zone: str, offset: int, hourly: bool) -> None:
        self.content_layout.addWidget(section_label(title))
        if not records:
            self.content_layout.addWidget(QLabel("예보 자료가 아직 없어요."))
            return
        row = QHBoxLayout()
        row.setSpacing(10)
        for record in records[:48]:
            wx = (record.get("weather") or [{}])[0]
            frame = QFrame()
            frame.setObjectName("forecastItem")
            frame.setMinimumWidth(118)
            layout = QVBoxLayout(frame)
            layout.setContentsMargins(10, 10, 10, 10)
            time_text = format_time(int(record.get("dt", 0)), zone, offset, "%m/%d %H:%M" if hourly else "%a %d")
            temperature = (record.get("main") or {}).get("temp", "—") if hourly else record.get("temp", "—")
            chance = record.get("pop")
            layout.addWidget(centered(time_text, bold=True))
            layout.addWidget(centered(weather_emoji(wx), size=28))
            layout.addWidget(centered(f"{round(float(temperature))}°" if temperature != "—" else "—"))
            if chance is not None:
                layout.addWidget(centered(f"강수 {round(float(chance) * 100)}%", small=True))
            row.addWidget(frame)
        row_widget = QWidget()
        row_widget.setLayout(row)
        forecast_scroll = QScrollArea()
        forecast_scroll.setWidgetResizable(True)
        forecast_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAsNeeded)
        forecast_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        forecast_scroll.setFrameShape(QFrame.Shape.NoFrame)
        forecast_scroll.setFixedHeight(190)
        forecast_scroll.setWidget(row_widget)
        self.content_layout.addWidget(forecast_scroll)

    def _daily_summaries(self, records: list[dict[str, Any]], offset: int) -> list[dict[str, Any]]:
        days: dict[str, list[dict[str, Any]]] = {}
        local_tz = timezone(timedelta(seconds=offset))
        for record in records:
            local_dt = datetime.fromtimestamp(int(record.get("dt", 0)), timezone.utc).astimezone(local_tz)
            days.setdefault(local_dt.strftime("%Y-%m-%d"), []).append(record)

        summaries = []
        for entries in days.values():
            temps = [float((entry.get("main") or {}).get("temp", 0)) for entry in entries]
            representative = min(
                entries,
                key=lambda entry: abs(
                    datetime.fromtimestamp(int(entry.get("dt", 0)), timezone.utc)
                    .astimezone(local_tz).hour - 12
                ),
            )
            summaries.append({
                "dt": representative.get("dt", 0),
                "temp": {"min": min(temps), "max": max(temps)},
                "weather": representative.get("weather", []),
                "pop": max(float(entry.get("pop", 0) or 0) for entry in entries),
            })
        return summaries

    def _render_daily(self, records: list[dict[str, Any]], zone: str, offset: int) -> None:
        self.content_layout.addWidget(section_label("날짜별 요약 (3시간 예보 집계)"))
        if not records:
            self.content_layout.addWidget(QLabel("일별 예보 자료가 아직 없어요."))
            return
        for record in records[:7]:
            wx = (record.get("weather") or [{}])[0]
            temps = record.get("temp") or {}
            row = QFrame()
            row.setObjectName("forecastItem")
            layout = QHBoxLayout(row)
            layout.setContentsMargins(16, 9, 16, 9)
            day = QLabel(format_time(int(record.get("dt", 0)), zone, offset, "%m월 %d일 (%a)"))
            day.setMinimumWidth(190)
            icon = QLabel(weather_emoji(wx))
            desc = QLabel(wx.get("description", ""))
            desc.setObjectName("muted")
            rain = QLabel(f"강수 {round(float(record.get('pop', 0)) * 100)}%")
            rain.setMinimumWidth(110)
            high = QLabel(f"예상 높은 값 {round(float(temps.get('max', 0)))}°")
            low = QLabel(f"예상 낮은 값 {round(float(temps.get('min', 0)))}°")
            high.setStyleSheet("font-weight: 700;")
            layout.addWidget(day)
            layout.addWidget(icon)
            layout.addWidget(desc, 1)
            layout.addWidget(rain)
            layout.addWidget(high)
            layout.addWidget(low)
            self.content_layout.addWidget(row)


def centered(text: str, bold: bool = False, size: int | None = None, small: bool = False) -> QLabel:
    label = QLabel(text)
    label.setAlignment(Qt.AlignmentFlag.AlignCenter)
    styles = []
    if bold:
        styles.append("font-weight: 700")
    if size:
        styles.append(f"font-size: {size}px")
    if small:
        styles.append("font-size: 15px; color: #45647a")
    if styles:
        label.setStyleSheet("; ".join(styles))
    return label


def format_optional(value: Any, zone: str, offset: int) -> str:
    if value in (None, 0, ""):
        return "—"
    return format_time(int(value), zone, offset, "%H:%M")


def main() -> int:
    app = QApplication(sys.argv)
    app.setApplicationName("SimpleWeather")
    app.setOrganizationName("SimpleWeather")
    app.setStyle("Fusion")
    app.setStyleSheet(STYLE)
    app.setFont(QFont("Malgun Gothic", 11))
    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
