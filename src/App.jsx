import { useMemo, useState } from "react";
import { facilityConfig } from "./facilityConfig";

const STORAGE_KEY = "staffAssemblyNaviReport";

const initialReport = {
  location: "",
  safety: "無事",
  attendance: "判断中",
  eta: "",
  transport: "徒歩",
  family: "安否確認中",
  home: "確認中",
  note: ""
};

const attendanceMap = {
  "参集できる": "可能",
  "条件付きで参集できる": "条件付き",
  "今は参集できない": "不可",
  "まだ判断できない": "判断中"
};

const intensityDetailMap = {
  "震度5弱以下": {
    title: "参集基準：震度5弱以下",
    text: "原則として通常運営です。ただし、自宅・家族・交通状況に影響がある場合は、施設スマホへ報告してください。",
    checks: [
      "自分と家族の安全を確認する",
      "自宅に大きな被害がないか確認する",
      "通勤・出勤に支障がある場合は施設スマホへ報告する",
      "通常勤務が難しい場合は、早めに施設スマホへ報告する"
    ],
    buttons: ["report", "attendance", "intensity"]
  },
  "震度5強": {
    title: "参集基準：震度5強",
    text: "施設長、管理職、災害対応担当者を中心に参集を検討します。その他職員は、施設からの連絡に備えてください。",
    checks: [
      "自分と家族の安全を確保する",
      "自宅の被害状況を確認する",
      "施設からの連絡に備える",
      "出勤・勤務に影響がある場合は施設スマホへ報告する",
      "施設から指示があった場合は、参集可否を報告する"
    ],
    buttons: ["general", "manager", "report", "attendance", "intensity"]
  },
  "震度6弱": {
    title: "参集基準：震度6弱",
    text: "役職者は参集対象です。その他職員は緊急招集に備え、施設スマホへ安否と参集可否を報告してください。",
    checks: [
      "自分と家族の安全を確保する",
      "自宅の被害状況を確認する",
      "施設スマホへ安否と参集可否を報告する",
      "施設からの緊急招集に備える",
      "指示があるまでは無理に移動を開始しない"
    ],
    buttons: ["general", "manager", "report", "attendance", "intensity"]
  },
  "震度6強以上": {
    title: "参集基準：震度6強以上",
    text: "全職員が参集対象です。ただし、本人・家族の安全確保、自宅の安全確認、移動経路の安全確認を行ったうえで、施設スマホへ報告してください。",
    checks: [
      "自分の安全を確保した",
      "家族の安否を確認した、または確認中",
      "自宅の被害状況を確認した、または確認中",
      "移動経路の危険性を確認した",
      "施設スマホへ参集可否を報告する"
    ],
    buttons: ["attendance", "report", "intensity"]
  },
  "震度がわからない": {
    title: "震度がわからない場合",
    text: "震度が不明でも、大きな揺れを感じた場合や、自宅・家族・交通状況に影響がある場合は、施設スマホへ報告してください。",
    checks: [
      "自分と家族の安全を確認する",
      "自宅の被害状況を確認する",
      "テレビ・ラジオ・防災アプリ等で情報を確認する",
      "施設へ連絡できる場合は、現在の状況を報告する",
      "参集できるか不明な場合も「判断中」として報告する"
    ],
    buttons: ["attendance", "report", "intensity"]
  }
};

const roleDetailMap = {
  "震度5強": {
    general: {
      title: "震度5強：一般職員向け",
      text: "施設からの連絡に備えてください。出勤・勤務・自宅や家族の状況に影響がある場合は、施設スマホへ状況を報告してください。",
      checks: [
        "自分と家族の安全を確保する",
        "自宅の被害状況を確認する",
        "施設からの連絡に備える",
        "出勤・勤務に影響がある場合は施設スマホへ報告する",
        "施設から指示があった場合は、参集可否を報告する"
      ],
      buttons: ["report", "attendance", "backDetail", "intensity"]
    },
    manager: {
      title: "震度5強：役職者向け",
      text: "役職者は、自分と家族の安全を確保したうえで、施設スマホへ参集可否を報告してください。",
      checks: [
        "自分と家族の安全を確保する",
        "施設スマホへ参集可否を報告する",
        "参集可能な場合、移動手段と到着見込みを報告する",
        "参集困難な場合、理由と連絡可能状況を報告する"
      ],
      buttons: ["attendance", "report", "backDetail", "intensity"]
    }
  },
  "震度6弱": {
    general: {
      title: "震度6弱：一般職員向け",
      text: "施設スマホへ安否と参集可否を報告してください。指示があるまでは、無理に移動を開始しないでください。",
      checks: [
        "自分と家族の安全を確保する",
        "自宅の被害状況を確認する",
        "施設スマホへ安否と参集可否を報告する",
        "施設からの緊急招集に備える",
        "指示があるまでは無理に移動を開始しない"
      ],
      buttons: ["attendance", "report", "backDetail", "intensity"]
    },
    manager: {
      title: "震度6弱：役職者向け",
      text: "役職者は参集対象です。施設スマホへ参集可否、移動手段、到着見込みを報告してください。",
      checks: [
        "自分と家族の安全を確保する",
        "施設スマホへ参集可否を報告する",
        "参集可能な場合、移動手段と到着見込みを報告する",
        "参集困難な場合、理由と連絡可能状況を報告する",
        "参集後、施設状況の把握・職員体制確認を行う"
      ],
      buttons: ["attendance", "report", "backDetail", "intensity"]
    }
  }
};

const detailButtonLabels = {
  general: "一般職員向け",
  manager: "役職者向け",
  report: "施設へ報告する内容を見る",
  attendance: "参集可否を選択する",
  statusReport: "状況を報告する",
  backDetail: "震度別画面へ戻る",
  intensity: "震度選択へ戻る"
};

const detailButtonTargets = {
  report: "report",
  attendance: "attendance",
  statusReport: "attendance",
  backDetail: "intensityDetail",
  intensity: "intensity"
};

function loadReport() {
  try {
    const savedReport = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeReport({ ...initialReport, ...savedReport });
  } catch {
    return initialReport;
  }
}

function normalizeReport(report) {
  return {
    ...report,
    family: report.family === "確認必要" ? "安否確認中" : report.family
  };
}

function formatAttendance(value) {
  const labels = {
    不可: "現時点では不可",
    判断中: "現時点では判断中",
    条件付き: "条件付きで可能",
    可能: "可能"
  };
  return labels[value] || value;
}

function valueOrFallback(value, fallback) {
  return value && value.trim() ? value : fallback;
}

function saveReport(report) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
  } catch {
    // 入力は画面上に残るため、保存できない環境でも操作は継続できます。
  }
}

function removeSavedReport() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 保存領域が使えない環境では何もしません。
  }
}

function App() {
  const [screen, setScreen] = useState("top");
  const [intensity, setIntensity] = useState("");
  const [roleType, setRoleType] = useState("");
  const [report, setReport] = useState(loadReport);
  const [copied, setCopied] = useState(false);
  const [created, setCreated] = useState(false);

  const updateReport = (key, value) => {
    const next = { ...report, [key]: value };
    setReport(next);
    setCreated(false);
    setCopied(false);
    saveReport(next);
  };

  const chooseAttendance = (label) => {
    updateReport("attendance", attendanceMap[label]);
    setScreen("report");
  };

  const resetReport = () => {
    setReport(initialReport);
    removeSavedReport();
    setCreated(false);
    setCopied(false);
  };

  const reportText = useMemo(
    () =>
      [
        `現在地：${valueOrFallback(report.location, "未入力")}`,
        `本人安否：${report.safety}`,
        `参集：${formatAttendance(report.attendance)}`,
        `到着見込み：${valueOrFallback(report.eta, "現時点では不明")}`,
        `移動手段：${report.transport}`,
        `家族状況：${report.family}`,
        `自宅状況：${report.home}`,
        `その他：${valueOrFallback(report.note, "なし")}`
      ].join("\n"),
    [report]
  );

  const copyReport = async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API is not available.");
      }
      await navigator.clipboard.writeText(reportText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = reportText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
  };

  return (
    <div className="app">
      <header className="appHeader">
        <div>
          <p className="facility">{facilityConfig.facilityName}</p>
          <h1>{screenTitles[screen]}</h1>
        </div>
        {screen !== "top" && (
          <button className="smallButton" onClick={() => setScreen("top")}>
            トップ
          </button>
        )}
      </header>

      <main>
        {screen === "top" && <TopScreen go={setScreen} />}
        {screen === "earthquake" && <EarthquakeScreen go={setScreen} />}
        {screen === "intensity" && (
          <IntensityScreen
            choose={(value) => {
              setIntensity(value);
              setRoleType("");
              setScreen("intensityDetail");
            }}
          />
        )}
        {screen === "intensityDetail" && (
          <IntensityDetailScreen
            intensity={intensity}
            go={setScreen}
            openRole={(nextRoleType) => {
              setRoleType(nextRoleType);
              setScreen("roleDetail");
            }}
          />
        )}
        {screen === "roleDetail" && (
          <RoleDetailScreen
            intensity={intensity}
            roleType={roleType}
            go={setScreen}
          />
        )}
        {screen === "attendance" && (
          <AttendanceScreen intensity={intensity} choose={chooseAttendance} />
        )}
        {screen === "report" && (
          <ReportScreen
            report={report}
            updateReport={updateReport}
            reportText={reportText}
            copyReport={copyReport}
            copied={copied}
            created={created}
            createReport={() => {
              saveReport(report);
              setCreated(true);
            }}
            resetReport={resetReport}
            next={() => setScreen("contact")}
          />
        )}
        {screen === "contact" && <ContactScreen go={setScreen} />}
        {screen === "dial171" && <Dial171Screen />}
      </main>
      <FooterNav currentScreen={screen} go={setScreen} />
    </div>
  );
}

const screenTitles = {
  top: "職員参集ナビ",
  earthquake: "地震時の参集判断",
  intensity: "震度を選択してください",
  intensityDetail: "震度別の確認",
  roleDetail: "職員区分別の確認",
  attendance: "参集可否を選択してください",
  report: "報告文作成",
  contact: "連絡手段確認",
  dial171: "災害用伝言ダイヤル171"
};

function TopScreen({ go }) {
  return (
    <section className="panel">
      <p className="lead importantMessage">
        災害時に、施設への連絡内容と参集判断を確認するナビです。まずは、自分と家族の安全を確保してください。
      </p>
      <p className="offlineNotice">
        このナビは、事前にスマホで開いておくことで、通信が不安定な状況でも基本画面を確認できます。SMS・メール・LINE・電話・171の利用には通信状況が必要です。
      </p>
      <div className="buttonStack">
        <button onClick={() => go("earthquake")}>地震のとき</button>
        <button onClick={() => go("report")}>施設へ報告する内容</button>
        <button onClick={() => go("contact")}>連絡手段を確認</button>
        <button onClick={() => go("dial171")}>171の使い方</button>
      </div>
    </section>
  );
}

function EarthquakeScreen({ go }) {
  const checks = [
    "自分の安全を確保した",
    "家族の安全を確認した、または確認中",
    "自宅の被害状況を確認した、または確認中",
    "施設へ連絡できる手段を確認する"
  ];

  return (
    <section className="panel">
      <p className="lead importantMessage">
        地震発生時は、まず自分と家族の安全確保を優先してください。そのうえで、施設への報告・参集可否の確認を行います。
      </p>
      <div className="checkList">
        {checks.map((item) => (
          <label key={item}>
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <button onClick={() => go("intensity")}>震度を選択する</button>
    </section>
  );
}

function IntensityScreen({ choose }) {
  return (
    <section className="panel">
      <div className="buttonStack">
        {["震度5弱以下", "震度5強", "震度6弱", "震度6強以上", "震度がわからない"].map(
          (item) => (
            <button key={item} onClick={() => choose(item)}>
              {item}
            </button>
          )
        )}
      </div>
    </section>
  );
}

function IntensityDetailScreen({ intensity, go, openRole }) {
  const detail = intensityDetailMap[intensity] || intensityDetailMap["震度がわからない"];

  return (
    <section className="panel">
      <h2>{detail.title}</h2>
      <p className="lead importantMessage">{detail.text}</p>
      <div className="checkList">
        {detail.checks.map((item) => (
          <label key={item}>
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <div className="buttonStack">
        {detail.buttons.map((buttonKey) => (
          <button
            key={buttonKey}
            className={buttonKey === "intensity" ? "secondary" : ""}
            onClick={() => {
              if (buttonKey === "general" || buttonKey === "manager") {
                openRole(buttonKey);
                return;
              }
              go(detailButtonTargets[buttonKey]);
            }}
          >
            {detailButtonLabels[buttonKey]}
          </button>
        ))}
      </div>
    </section>
  );
}

function RoleDetailScreen({ intensity, roleType, go }) {
  const detail =
    roleDetailMap[intensity]?.[roleType] || roleDetailMap["震度5強"].general;

  return (
    <section className="panel">
      <h2>{detail.title}</h2>
      <p className="lead importantMessage">{detail.text}</p>
      <div className="checkList">
        {detail.checks.map((item) => (
          <label key={item}>
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <div className="buttonStack">
        {detail.buttons.map((buttonKey) => (
          <button
            key={buttonKey}
            className={
              buttonKey === "backDetail" || buttonKey === "intensity"
                ? "secondary"
                : ""
            }
            onClick={() => go(detailButtonTargets[buttonKey])}
          >
            {buttonKey === "backDetail"
              ? `${intensity}へ戻る`
              : roleType === "general" &&
                  intensity === "震度5強" &&
                  buttonKey === "attendance"
                ? detailButtonLabels.statusReport
                : detailButtonLabels[buttonKey]}
          </button>
        ))}
      </div>
    </section>
  );
}

function AttendanceScreen({ intensity, choose }) {
  return (
    <section className="panel">
      {intensity && <p className="badge">選択した震度：{intensity}</p>}
      <p className="lead importantMessage">
        現時点での状況を選択してください。後で状況が変わった場合は、再度施設スマホへ報告してください。
      </p>
      <div className="buttonStack">
        {["参集できる", "条件付きで参集できる", "今は参集できない", "まだ判断できない"].map(
          (item) => (
            <button key={item} onClick={() => choose(item)}>
              {item}
            </button>
          )
        )}
      </div>
    </section>
  );
}

function ReportScreen({
  report,
  updateReport,
  reportText,
  copyReport,
  copied,
  created,
  createReport,
  resetReport,
  next
}) {
  return (
    <section className="panel">
      <p className="offlineNotice">
        報告文の作成とコピーは、通信が不安定な状況でも利用できます。通信が戻ったら、コピーした報告文をSMS・メール・LINEなどで送ってください。
      </p>
      <div className="formGrid">
        <TextInput label="現在地" value={report.location} onChange={(v) => updateReport("location", v)} />
        <SelectInput label="本人安否" value={report.safety} options={["無事", "負傷あり"]} onChange={(v) => updateReport("safety", v)} />
        <SelectInput label="参集可否" value={report.attendance} options={["可能", "条件付き", "不可", "判断中"]} onChange={(v) => updateReport("attendance", v)} />
        <TextInput label="到着見込み" value={report.eta} onChange={(v) => updateReport("eta", v)} />
        <SelectInput label="移動手段" value={report.transport} options={["徒歩", "自転車", "車", "公共交通機関", "その他"]} onChange={(v) => updateReport("transport", v)} />
        <SelectInput label="家族状況" value={report.family} options={["問題なし", "安否確認中", "対応中", "不明"]} onChange={(v) => updateReport("family", v)} />
        <SelectInput label="自宅状況" value={report.home} options={["問題なし", "被害あり", "確認中", "不明"]} onChange={(v) => updateReport("home", v)} />
        <label className="field">
          <span>その他</span>
          <textarea value={report.note} onChange={(event) => updateReport("note", event.target.value)} rows="4" />
        </label>
      </div>

      <div className="reportBox">
        <h2>生成した報告文</h2>
        <pre>{reportText}</pre>
      </div>

      {created && <p className="success">報告文を作成しました</p>}
      {copied && <p className="success">コピーしました</p>}

      <div className="buttonStack">
        <button className="secondary" onClick={createReport}>報告文を作成する</button>
        <button className="copyButton" onClick={copyReport}>報告文をコピーする</button>
        <button className="secondary" onClick={resetReport}>入力内容をリセット</button>
        <button className="secondary" onClick={next}>連絡手段を確認</button>
      </div>
    </section>
  );
}

function ContactScreen({ go }) {
  const methods = [
    ["1. SMS", facilityConfig.facilitySmartphone, "送信には通信状況が必要です"],
    ["2. メール", facilityConfig.facilityEmail, "送信には通信状況が必要です"],
    [
      "3. LINE",
      "施設LINEまたは指定の連絡グループ",
      facilityConfig.lineNote.replace("施設LINEまたは指定の連絡グループへ、コピーした報告文を送信してください。", "")
    ],
    ["4. 電話", facilityConfig.representativePhone, "発信には通信状況が必要です"],
    ["5. 171", facilityConfig.dial171Phone, "171への発信には通信状況が必要です"]
  ];

  return (
    <section className="panel">
      <p className="lead importantMessage">
        つながる方法で、短く報告してください。電話は混雑しやすいため、文字で残せる手段を優先します。
      </p>
      <p className="offlineNotice">
        このナビは、事前にスマホで開いておくことで、通信が不安定な状況でも基本画面を確認できます。SMS・メール・LINE・電話・171の利用には通信状況が必要です。
      </p>
      <ol className="methodList">
        {methods.map(([name, detail, caution]) => (
          <li key={name}>
            <strong>{name}</strong>
            <span>{detail}</span>
            <em>{caution}</em>
          </li>
        ))}
      </ol>
      <button onClick={() => go("dial171")}>171の使い方を見る</button>
    </section>
  );
}

function Dial171Screen() {
  return (
    <section className="panel">
      <p className="lead importantMessage">
        171は、SMS・メール・LINE・電話で施設へ連絡できない場合の補助的な連絡手段です。
      </p>
      <p className="offlineNotice">
        171への発信には通信状況が必要です。圏外の場合は、報告文を作成・コピーしておき、通信が戻ったら送信してください。
      </p>
      <div className="phoneDisplay">
        <span>施設電話番号</span>
        <strong>{facilityConfig.dial171Phone}</strong>
      </div>
      <a className="callButton" href="tel:171">171へ電話する</a>
      <ol className="stepList">
        <li>171へ電話する</li>
        <li>録音は「1」を選ぶ</li>
        <li>施設の電話番号を入力する（{facilityConfig.dial171Phone}）</li>
        <li>音声案内に従い、現在地・本人安否・参集可否・到着見込み・家族状況を短く残す</li>
      </ol>
      <p className="offlineNotice">
        171に残す内容は、完璧でなくて構いません。施設が状況を把握できるよう、短く伝えることを優先してください。
      </p>
    </section>
  );
}

function FooterNav({ currentScreen, go }) {
  const items = [
    ["top", "トップ"],
    ["report", "報告文"],
    ["contact", "連絡手段"],
    ["dial171", "171"]
  ];

  return (
    <nav className="footerNav" aria-label="ショートカット">
      {items.map(([target, label]) => (
        <button
          key={target}
          className={currentScreen === target ? "active" : ""}
          onClick={() => go(target)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default App;
