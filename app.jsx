const { useState, useEffect, useLayoutEffect, useRef } = React;
const S = Seating;
const paths = { seats: "M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h6v6h-6z", students: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", history: "M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0", templates: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z", settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2", plus: "M12 4v16 M4 12h16", move: "M4 3l6 17 3-7 7-3z", rotate: "M20 7v-4 M20 7h-4 M20 7a9 9 0 1 0 1 8", shuffle: "M3 7h3c5 0 7 10 12 10h3 M18 14l3 3-3 3 M3 17h3c2 0 3-1 4-3 M14 8c1-1 2-1 4-1h3 M18 4l3 3-3 3", clear: "M4 8h16 M9 8V4h6v4 M6 8l1 13h10l1-13", print: "M6 9V3h12v6 M6 18H3V9h18v9h-3 M6 14h12v7H6z", share: "M10 13l4-4 M8 16l-2 2a4 4 0 0 1-6-6l5-5 M16 8l2-2a4 4 0 0 1 6 6l-5 5", search: "M21 21l-6-6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0", room: "M4 21V3h16v18 M8 21V8h8v13", list: "M9 5h12 M9 12h12 M9 19h12 M3 5h1 M3 12h1 M3 19h1", undo: "M8 3L3 8l5 5 M3 8h10a7 7 0 0 1 0 14", redo: "M16 3l5 5-5 5 M21 8H11a7 7 0 0 0 0 14", help: "M9 9a3 3 0 1 1 5 2l-2 2 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0" };
function Icon({ name }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.seats} /></svg>;
}
function Button({ icon, children, ...props }) {
  return <button {...props}>{icon && <Icon name={icon} />} {children}</button>;
}
function download(name, text, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function Dialog({ title, onClose, children }) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    ref.current.showModal();
    return () => old?.focus();
  }, []);
  return <dialog ref={ref} onCancel={(e) => {
    e.preventDefault();
    onClose();
  }}><header><h2>{title}</h2><button aria-label="Close dialog" onClick={onClose}>×</button></header>{children}</dialog>;
}
function Demo() {
  const c = S.makeClass("English 9A");
  c.students = ["Emma", "Liam", "Sophie", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Olivia", "Jackson", "Amelia", "Elijah", "Harper", "Aiden", "Chloe", "Daniel"].map((name) => S.student({ id: S.id(), name }));
  c.currentAssignment = S.randomize(c);
  return S.migrate({ classes: [c], activeClassId: c.id });
}
function confirmAction(message) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    const title = document.createElement("h2");
    title.textContent = "Confirm change";
    const body = document.createElement("p");
    body.textContent = message;
    const buttons = document.createElement("div");
    buttons.className = "button-row";
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    const proceed = document.createElement("button");
    proceed.textContent = "Confirm";
    proceed.className = "primary";
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      dialog.close();
      dialog.remove();
      resolve(value);
    };
    cancel.onclick = () => finish(false);
    proceed.onclick = () => finish(true);
    dialog.oncancel = (e) => {
      e.preventDefault();
      finish(false);
    };
    buttons.append(cancel, proceed);
    dialog.append(title, body, buttons);
    document.body.append(dialog);
    dialog.showModal();
    cancel.focus();
  });
}
function App() {
  const demo = new URLSearchParams(location.search).get("demo") === "1";
  const [user, setUser] = useState(null), [phase, setPhase] = useState(demo ? "ready" : "loading"), [data, setData] = useState(() => demo ? Demo() : null), [error, setError] = useState(""), [sync, setSync] = useState(demo ? "Demo \xB7 not saved" : "Loading"), [tab, setTab] = useState("Seats"), [view, setView] = useState("room"), [modal, setModal] = useState(null), [selected, setSelected] = useState(null), [search, setSearch] = useState(""), [picked, setPicked] = useState(null), [zoom, setZoom] = useState(1), [drawer, setDrawer] = useState(""), [preview, setPreview] = useState(null), [archived, setArchived] = useState(false), [shared, setShared] = useState(null), [links, setLinks] = useState([]), [outputGender, setOutputGender] = useState(false);
  const viewport = useRef(null), [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    if (!viewport.current) return;
    const room = S.roomSize(data?.classes.find(x => x.id === data.activeClassId) || {});
    const resize = () => setFit(Math.min(1.3, viewport.current.clientWidth / room.width, viewport.current.clientHeight / room.height));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [phase, tab, data?.activeClassId, data?.classes.find(x => x.id === data.activeClassId)?.room?.width, data?.classes.find(x => x.id === data.activeClassId)?.room?.height]);
  const suppressStudentClick = useRef(false);
  const past = useRef([]), future = useRef([]), dirty = useRef(false), revision = useRef(0), session = useRef(0), saveChain = useRef(Promise.resolve()), [undoTick, setUndoTick] = useState(0);
  const c = data?.classes.find((c2) => c2.id === data.activeClassId), prefs = data?.preferences || { showGender: false, nameStyle: "first", genderColors: S.colors };
  const commit = (fn) => {
    setData((old) => {
      const next = fn(S.clone(old));
      past.current.push(old);
      if (past.current.length > 60) past.current.shift();
      future.current = [];
      dirty.current = true;
      revision.current++;
      return next;
    });
  };
  const update = (fn) => commit((d) => ({ ...d, classes: d.classes.map((x) => x.id === d.activeClassId ? fn(x) : x) }));
  const undo = (redo) => {
    const src = redo ? future : past, dst = redo ? past : future;
    if (!src.current.length) return;
    dst.current.push(data);
    setData(src.current.pop());
    dirty.current = true;
    revision.current++;
    setUndoTick((x) => x + 1);
  };
  const act = (fn) => {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    if (demo) return;
    let unsubAccess = () => {}, unsubShare = () => {}, accessTimer, shareTimer;
    const deny = message => {
      session.current++;
      setData(null); setShared(null); setUser(null); setPhase("denied"); setError(message);
    };
    const unsub = fbAuth.onAuthStateChanged(async (u) => {
      const epoch = ++session.current;
      unsubAccess(); unsubShare(); clearTimeout(accessTimer); clearTimeout(shareTimer);
      dirty.current = false;
      past.current = [];
      future.current = [];
      setUser(null);
      setData(null);
      setShared(null);
      setPhase(u ? "loading" : "signedout");
      if (!u) return;
      try {
        const token = await u.getIdTokenResult(true);
        if (!u.emailVerified || !u.email?.toLowerCase().endsWith("@markdayschool.org") || token.signInProvider !== "google.com") throw Error("Use your verified Mark Day School Google account.");
        const ref = fbDb.collection("facultyAccess").doc(u.uid);
        const access = await ref.get({ source: "server" });
        if (!access.exists || access.data().email !== u.email || access.data().expiresAt.toMillis() <= Date.now()) throw Error("Faculty authorization is missing or expired. An administrator must approve your school account on the Faculty allowlist.");
        const snap = await fbDb.collection("users").doc(u.uid).get({ source: "server" });
        if (epoch !== session.current) return;
        const next = snap.exists ? S.migrate(snap.data().d) : S.migrate({ classes: [], activeClassId: null });
        setData(next);
        setUser(u);
        setPhase("ready");
        setSync("Saved to cloud");
        unsubAccess = ref.onSnapshot(a => {
          clearTimeout(accessTimer);
          if (!a.exists || a.data().email !== u.email || a.data().expiresAt.toMillis() <= Date.now()) { deny("Faculty access expired or was revoked."); return; }
          accessTimer = setTimeout(() => deny("Faculty access expired. Sign in again after administrator verification."), a.data().expiresAt.toMillis() - Date.now());
        }, () => deny("Faculty access could not be verified."));
        const code = new URLSearchParams(location.search).get("share");
        if (code) {
          const ss = await fbDb.collection("sharedViews").doc(code).get({ source: "server" });
          if (epoch !== session.current) return;
          if (!ss.exists) throw Error("This shared view is unavailable.");
          if(ss.data().expiresAt.toMillis() <= Date.now()) throw Error("This shared view has expired.");
          setShared(ss.data().chart);
          shareTimer = setTimeout(() => deny("This shared view has expired."), ss.data().expiresAt.toMillis() - Date.now());
          unsubShare = fbDb.collection("sharedViews").doc(code).onSnapshot(value => {
            if (!value.exists) deny("This shared view was revoked.");
          }, () => deny("This shared view is no longer available."));
        }
      } catch (e) {
        if (epoch !== session.current) return;
        setPhase("denied");
        setError(e.message);
      }
    });
    return () => {
      unsub();
      unsubAccess(); unsubShare(); clearTimeout(accessTimer); clearTimeout(shareTimer);
      session.current++;
    };
  }, []);
  useEffect(() => {
    if (demo || phase !== "ready" || !user || !dirty.current) return;
    const epoch = session.current, rev = revision.current;
    setSync("Saving\u2026");
    const timer = setTimeout(() => {
      saveChain.current = saveChain.current.catch(() => {
      }).then(async () => {
        if (epoch !== session.current) return;
        try {
          await fbDb.collection("users").doc(user.uid).set({ d: data, savedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
          if (epoch === session.current && rev === revision.current) {
            dirty.current = false;
            setSync("Saved to cloud");
          }
        } catch (e) {
          if (epoch === session.current) {
            setSync("Save failed \xB7 retry");
            setError("Cloud save failed. Keep this page open and retry. " + e.message);
          }
        }
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [data, phase, user, undoTick]);
  useEffect(() => {
    const unload = (e) => {
      if (dirty.current && !demo) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, []);
  useEffect(() => {
    const fn = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo(e.shiftKey);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [data]);
  const selectClass = (id) => {
    setSelected(null);
    setPicked(null);
    setDrawer("");
    setData((d) => ({ ...d, activeClassId: id }));
  };
  const saveArrangement = (assignment, label = "Seating arrangement") => update((x) => ({ ...x, currentAssignment: assignment, seatingHistory: [{ id: S.id(), date: (/* @__PURE__ */ new Date()).toISOString(), name: label, assignment: S.clone(assignment), room: S.roomSize(x), tables: S.clone(x.tables), screen: S.clone(x.screen), furniture: S.clone(x.furniture) }, ...x.seatingHistory] }));
  const addTable = (seats = 4) => {
    const id = S.id();
    update((x) => ({ ...x, tables: [...x.tables, { id, label: seats === 1 ? "Individual seat" : `Table ${x.tables.length + 1}`, seats, orientation: "H", x: 60 + x.tables.length % 3 * 260, y: 70 + Math.floor(x.tables.length / 3) % 2 * 170 }] }));
    setSelected(id);
    setTab("Seats");
  };
  const changeTable = (fn) => update((x) => {
    const tables = x.tables.map((t) => t.id === selected ? S.boundTable(x,fn(t)) : t);
    const limit = tables.find((t) => t.id === selected)?.seats;
    const removed = (x.currentAssignment?.[selected] || []).slice(limit);
    return { ...x, tables, currentAssignment: { ...x.currentAssignment, [selected]: (x.currentAssignment?.[selected] || []).slice(0, limit) }, lockedStudents: x.lockedStudents.filter((id) => !removed.includes(id)) };
  });
  const setPref = (key, value) => commit((d) => ({ ...d, preferences: { ...d.preferences, [key]: value } }));
  const place = (tid, seat, sid = picked) => {
    if (!sid) {
      const current = c.currentAssignment?.[tid]?.[seat];
      if (current) setPicked(current);
      return;
    }
    act(() => {
      const result = S.assign(c, sid, tid, seat);
      update(() => result);
      setPicked(null);
    });
  };
  const startStudentDrag = (e, sid) => {
    if (e.pointerType === "touch" && e.currentTarget.classList.contains("roster-student") && !e.target.closest(".drag-handle")) return;
    if (!sid || c.lockedStudents.includes(sid)) return;
    e.stopPropagation();
    const sx = e.clientX, sy = e.clientY;
    let moved = false, hover = null;
    e.currentTarget.setPointerCapture(e.pointerId);
    const move = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      moved = moved || Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5;
      if (!moved) return;
      document.body.style.cursor = "grabbing";
      if (hover) hover.classList.remove("drop-target");
      hover = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-seat-index]");
      hover?.classList.add("drop-target");
    };
    const finish = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      document.body.style.cursor = "";
      hover?.classList.remove("drop-target");
      if (moved) {
        suppressStudentClick.current = true;
        const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest("[data-seat-index]");
        if (target) place(target.dataset.tableId, +target.dataset.seatIndex, sid);
        setTimeout(() => {
          suppressStudentClick.current = false;
        }, 0);
      }
    };
    const cancel = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      hover?.classList.remove("drop-target");
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
  };
  const previewRandom = () => act(() => {
    setPreview(S.randomize(c, prefs.showGender));
    setModal("random");
  });
  const signOut = async () => {
    if (dirty.current && !demo && !await confirmAction("Unsaved changes remain. Leave without saving them?")) return;
    session.current++;
    setPhase("signedout");
    setData(null);
    setUser(null);
    await fbAuth.signOut();
  };
  const exportChart = () => {
    const rows = [["Table", "Seat", "Student", ...outputGender ? ["Gender"] : []]];
    c.tables.forEach((t) => Array.from({ length: t.seats }, (_, i) => {
      const s = c.students.find((s2) => s2.id === c.currentAssignment?.[t.id]?.[i]);
      rows.push([t.label, i + 1, s ? S.display(s, "full") : "", ...outputGender ? [s?.gender || ""] : []]);
    }));
    download(c.name + "-seating.csv", S.csv(rows));
  };
  const print = () => {
    document.body.classList.toggle("print-gender", outputGender);
    window.print();
    document.body.classList.remove("print-gender");
  };
  if (phase !== "ready") return <main className="login"><div className="login-card"><div className="brand-chair">🪑</div><p className="eyebrow">MARK DAY SCHOOL</p><h1>A place for everyone.</h1><p>Thoughtful classroom layouts.<br />More time for the moments that matter.</p>{phase === "loading" ? <p role="status">Verifying Faculty access…</p> : <><Button className="primary" onClick={() => fbAuth.signInWithPopup(gProvider).then(() => location.reload()).catch((e) => setError(e.message))}>Continue with school Google account</Button><p className="muted">Private · Mark Day Faculty only</p></>}{error && <p role="alert" className="error">{error}</p>}<a href="?demo=1">Explore with fictional students →</a><small>Demo data stays in memory and never connects to student records.</small></div></main>;
  if (shared) return <main className="shared"><h1>{shared.name}</h1><p>View only · Faculty access required</p><Chart c={shared} prefs={{ ...prefs, showGender: shared.includeGender }} view="grid" readOnly /><button onClick={() => {
    setShared(null);
    history.replaceState({}, "", location.pathname);
  }}>Back to my classes</button></main>;
  return <div className="app-shell" onClickCapture={(e) => {
    if (suppressStudentClick.current) {
      e.stopPropagation();
      suppressStudentClick.current = false;
    }
  }}>
 <header className="topbar no-print"><div className="brand"><span className="brand-chair">🪑</span><div><h1>Seating Chart</h1><small>Plan · Arrange · Engage</small></div></div><label className="class-picker"><span className="sr-only">Active class</span><select value={c?.id || ""} onChange={(e) => selectClass(e.target.value)}><option value="" disabled>Choose a class</option>{data.classes.filter((x) => !x.archived).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select><small>2026 – 2027</small></label><nav aria-label="Main navigation">{["Seats", "Students", "History", "Templates", "Settings"].map((name) => <Button key={name} icon={name.toLowerCase()} className={tab === name ? "active" : ""} aria-current={tab === name ? "page" : void 0} onClick={() => {
    setTab(name);
    setDrawer("");
  }}>{name}</Button>)}</nav><Button icon="help" aria-label="Help" onClick={() => setModal("help")} /><div className="account"><span className="avatar">{demo ? "D" : (user?.displayName || "F")[0]}</span><div><strong>{demo ? "Demo classroom" : user?.displayName || "Faculty"}</strong><small>{demo ? "Fictional students only" : "Faculty \xB7 Mark Day School"}</small></div>{!demo && <button onClick={signOut} aria-label="Sign out">↗</button>}</div></header>
 <div className="mobile-bar no-print"><button onClick={() => setDrawer(drawer === "classes" ? "" : "classes")}>☰ Classes & tools</button><button onClick={() => setDrawer(drawer === "roster" ? "" : "roster")}>Students ({c?.students.length || 0})</button></div>
 {error && <div className="error-banner no-print" role="alert">{error}<button aria-label="Dismiss error" onClick={() => setError("")}>×</button></div>}
 <div className="workspace">
 <aside className={"left-sidebar no-print " + (drawer === "classes" ? "open" : "")}><section className="panel classes"><div className="panel-heading"><h2>Classes</h2><Button icon="plus" className="primary square" aria-label="Create class" onClick={() => setModal("newClass")} /></div><div className="class-list">{data.classes.filter((x) => !!x.archived === archived).map((x, i) => <div className={"class-row " + (x.id === c?.id ? "active" : "")} key={x.id}><button onClick={() => selectClass(x.id)}><i style={{ background: ["#80b8fd", "#ed94bc", "#77c8aa", "#ab99e8", "#e7bf60"][i % 5] }} />{x.name}</button>{archived && <button aria-label={"Restore " + x.name} onClick={() => commit((d) => ({ ...d, classes: d.classes.map((y) => y.id === x.id ? { ...y, archived: false } : y) }))}>↩</button>}</div>)}{!data.classes.length && <p className="muted">Create your first class to get started.</p>}</div><button className="archive-link" onClick={() => setArchived(!archived)}>{archived ? "Active classes" : "Archived classes"} <span>→</span></button></section>
 <section className="panel tools"><h2>Tools</h2>{[["move", "Select / Move", () => {
    setTab("Seats");
    setPicked(null);
  }], ["plus", "Add Seat", () => addTable(1)], ["seats", "Add Table", () => addTable()], ["rotate", "Rotate", () => changeTable((t) => ({ ...t, orientation: t.orientation === "H" ? "V" : "H" }))], ["shuffle", "Randomize", previewRandom], ["clear", "Clear Assignments", async () => {
    if (await confirmAction("Clear assignments? Student records and saved history will remain.")) update((x) => ({ ...x, currentAssignment: {}, lockedStudents: [] }));
  }], ["students", "Balance Groups", previewRandom], ["print", "Printing / Export", () => {
    setOutputGender(false);
    setModal("export");
  }], ["share", "Share (View Only)", () => {
    setOutputGender(false);
    setModal("share");
  }]].map(([icon, label, fn], i) => <Button key={label} icon={icon} className={i === 0 ? "tool active" : "tool"} disabled={!c || label === "Rotate" && !selected} onClick={fn}>{label}</Button>)}<div className="save-status" role="status"><i />{sync}{sync.startsWith("Save failed") && <button onClick={() => setUndoTick((x) => x + 1)}>Retry</button>}</div></section></aside>
 <main className="main-workspace"><h1 className="print-title">{c?.name}</h1><div className="workspace-heading no-print"><div><p className="eyebrow">YOUR CLASSROOM, THOUGHTFULLY ARRANGED</p><h2>{c?.name || "Welcome to your classroom"}</h2></div>{c && <div className="history-controls"><Button icon="undo" aria-label="Undo" disabled={!past.current.length} onClick={() => undo(false)} /><Button icon="redo" aria-label="Redo" disabled={!future.current.length} onClick={() => undo(true)} /><button onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch((e) => setError(e.message))}>Present</button><button onClick={() => setModal("class")}>Class options</button></div>}</div>
 {!c ? <div className="empty-state"><span>🪑</span><h2>Make room for a great day.</h2><p>Create a class, add your students, and arrange your space.</p><Button icon="plus" className="primary" onClick={() => setModal("newClass")}>Create a class</Button></div> : <>
 {tab === "Seats" && <><div className="canvas-toolbar no-print"><button className="orientation" onClick={() => setModal("room")}>Room designer</button><div className="segmented">{["room", "grid", "list"].map((v) => <Button key={v} icon={v === "grid" ? "seats" : v} className={view === v ? "active" : ""} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</Button>)}</div></div><div className="canvas-viewport" ref={viewport}><Chart c={c} prefs={prefs} view={view} zoom={zoom * fit} selected={selected} setSelected={setSelected} update={update} picked={picked} setPicked={setPicked} place={place} startStudentDrag={startStudentDrag} /></div><div className="canvas-footer no-print">{picked && <button onClick={() => {
    if (c.lockedStudents.includes(picked)) {
      setError("Unlock the student in Settings first.");
      return;
    }
    update((x) => ({ ...x, currentAssignment: Object.fromEntries(Object.entries(x.currentAssignment || {}).map(([tid, ids]) => [tid, ids.map((id) => id === picked ? null : id)])) }));
    setPicked(null);
  }}>Unassign selected</button>}<span>{picked ? "Choose a seat to move or swap this student." : "Drag tables to arrange \xB7 Select a student, then a seat to assign"}</span><div><button aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>−</button><span>{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>+</button><button onClick={() => setZoom(1)}>Fit room</button></div></div>{selected && <TableEditor table={c.tables.find((t) => t.id === selected)} change={changeTable} remove={async () => {
    if (await confirmAction("Delete this table? Its students will become unassigned.")) {
      update((x) => {
        const a = { ...x.currentAssignment };
        const removed = a[selected] || [];
        delete a[selected];
        return { ...x, tables: x.tables.filter((t) => t.id !== selected), currentAssignment: a, lockedStudents: x.lockedStudents.filter((id) => !removed.includes(id)) };
      });
      setSelected(null);
    }
  }} duplicate={() => {
    const t = c.tables.find((t2) => t2.id === selected);
    update((x) => ({ ...x, tables: [...x.tables, { ...t, id: S.id(), label: t.label + " copy", x: Math.min(650, t.x + 30), y: Math.min(330, t.y + 30) }] }));
  }} />}</>}
 {tab === "Students" && <section className="content-panel"><div className="panel-heading"><h2>Student management</h2><Button icon="plus" className="primary" onClick={() => setModal({ student: null })}>Add student</Button></div><div className="button-row"><button onClick={() => setModal("import")}>Import CSV</button><button onClick={() => setModal("sheets")}>Import Google Sheets</button><button onClick={() => download(c.name + "-roster.csv", S.csv([["First name", "Last name", "Preferred name"], ...c.students.map((s) => [s.firstName, s.lastName, s.preferredName])]))}>Export roster CSV</button></div><p className="muted">Notes are private to you. Gender is optional and never inferred.</p>{c.students.map((s) => <div className="student-management" key={s.id}><div><strong>{S.display(s, "full")}</strong><small>{S.locate(c.currentAssignment, s.id) ? "Assigned" : "Unassigned"}{c.lockedStudents.includes(s.id) ? " \xB7 Locked" : ""}</small></div><button onClick={() => setModal({ student: s })}>Edit</button></div>)}</section>}
 {tab === "History" && <section className="content-panel"><div className="panel-heading"><h2>Seating history</h2><button className="primary" onClick={() => setModal({ naming: "arrangement" })}>Save current arrangement</button></div>{!c.seatingHistory.length && <p className="muted">Saved arrangements and randomization history appear here.</p>}{c.seatingHistory.map((h) => <article className="history-row" key={h.id}><div><strong>{h.name || "Seating arrangement"}</strong><small>{new Date(h.date).toLocaleString()}</small></div><button onClick={async () => {
    if (await confirmAction("Restore this arrangement? You can undo this change.")) update((x) => ({ ...x, currentAssignment: S.clone(h.assignment), room: h.room || S.roomSize(x), tables: h.tables ? S.clone(h.tables) : x.tables, screen: h.screen || x.screen, furniture: h.furniture || x.furniture, lockedStudents: [] }));
  }}>Restore</button></article>)}</section>}
 {tab === "Templates" && <section className="content-panel"><div className="panel-heading"><h2>Layout templates</h2><button className="primary" onClick={() => setModal({ naming: "template" })}>Save this layout</button></div><p className="muted">Templates contain furniture and seats only. Student information is never copied.</p>{data.templates.map((t) => <article className="history-row" key={t.id}><div><strong>{t.name}</strong><small>{t.tables.length} tables</small></div><button onClick={async () => {
    if (await confirmAction("Apply this layout and clear current assignments?")) update((x) => ({ ...x, room: t.room || {width:840,height:520}, tables: S.clone(t.tables), screen: S.clone(t.screen), furniture: S.clone(t.furniture), currentAssignment: {}, lockedStudents: [] }));
  }}>Apply</button><button onClick={async () => {
    if (await confirmAction("Delete this template?")) commit((d) => ({ ...d, templates: d.templates.filter((x) => x.id !== t.id) }));
  }}>Delete</button></article>)}</section>}
 {tab === "Settings" && <Settings c={c} update={update} prefs={prefs} setPref={setPref} onNewCategory={() => setModal({ naming: "category" })} />}
 </>}
 </main>
 <aside className={"right-sidebar no-print " + (drawer === "roster" ? "open" : "")}><section className="panel roster"><div className="panel-heading"><h2>Students ({c?.students.length || 0})</h2><Button icon="plus" className="primary square" aria-label="Add student" disabled={!c} onClick={() => setModal({ student: null })} /></div><label className="search"><Icon name="search" /><input placeholder="Search students…" aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} /></label><p className="roster-caption">{c?.students.filter((s) => !S.locate(c.currentAssignment, s.id)).length || 0} unassigned · drag or select to place</p><div className="roster-list">{c?.students.filter((s) => S.display(s, "full").toLowerCase().includes(search.toLowerCase())).map((s) => <button className={"roster-student " + (picked === s.id ? "active" : "")} key={s.id} draggable={false} onPointerDown={(e) => startStudentDrag(e, s.id)} onDragStart={(e) => {
    e.dataTransfer.setData("text/plain", s.id);
    setPicked(s.id);
  }} onClick={() => {
    setPicked(picked === s.id ? null : s.id);
    setTab("Seats");
    setDrawer("");
  }} aria-pressed={picked === s.id}><span className={S.locate(c.currentAssignment, s.id) ? "assigned-dot" : "unassigned-dot"} /><span>{S.display(s, "full")}</span><span className="drag-handle">{c.lockedStudents.includes(s.id) ? "\u{1F512}" : "\u283F"}</span></button>)}</div><button className="add-student" disabled={!c} onClick={() => setModal({ student: null })}>＋ Add Student</button></section><section className="panel display-options"><h2>Display Options</h2><label className="toggle-label"><span>Show gender colors</span><input type="checkbox" role="switch" checked={prefs.showGender} onChange={(e) => setPref("showGender", e.target.checked)} /></label><p>Optional. Off by default for a neutral view.</p><label>Name display<select value={prefs.nameStyle} onChange={(e) => setPref("nameStyle", e.target.value)}><option value="first">First names</option><option value="initial">First + last initial</option><option value="full">Full names</option></select></label></section></aside>
 </div>
 {modal && <Dialog title={typeof modal === "object" ? modal.naming ? "Choose a name" : "Student details" : { room: "Room designer", newClass: "Create a class", class: "Class options", random: "Preview seating arrangement", export: "Print & export", share: "Share a view-only chart", import: "Import students", sheets: "Import Google Sheets", help: "A little help" }[modal] || "Seating Chart"} onClose={() => {
    setModal(null);
    setPreview(null);
  }}>
 {modal.naming && <form onSubmit={(e) => {
    e.preventDefault();
    const name = new FormData(e.target).get("name").trim();
    if (!name) return;
    if (modal.naming === "arrangement") saveArrangement(c.currentAssignment || {}, name);
    else if (modal.naming === "rename") update((x) => ({ ...x, name }));
    else if (modal.naming === "category") setPref("genderLabels", { ...prefs.genderLabels || { F: "Female", M: "Male", NB: "Nonbinary", X: "Other / self-described" }, ["custom_" + S.id()]: name });
    else commit((d) => ({ ...d, templates: [...d.templates, { id: S.id(), name, room: S.roomSize(c), tables: S.clone(c.tables), screen: S.clone(c.screen), furniture: S.clone(c.furniture) }] }));
    setModal(null);
  }}><label>Name<input name="name" required autoFocus defaultValue={modal.naming === "rename" ? c.name : ""} /></label><button className="primary">Save name</button></form>}
 {modal === "newClass" && <form onSubmit={(e) => {
    e.preventDefault();
    const name = new FormData(e.target).get("name").trim();
    if (!name) return;
    const nc = S.makeClass(name);
    commit((d) => ({ ...d, classes: [...d.classes, nc], activeClassId: nc.id }));
    setModal(null);
  }}><label>Class name<input name="name" required autoFocus maxLength="100" placeholder="e.g. English 9A" /></label><button className="primary">Create class</button></form>}
 {typeof modal === "object" && !modal.naming && <StudentForm prefs={prefs} student={modal.student} save={(s) => {
    update((x) => ({ ...x, students: modal.student ? x.students.map((a) => a.id === s.id ? s : a) : [...x.students, s] }));
    setModal(null);
  }} remove={async () => {
    if (await confirmAction("Remove this student? Historical arrangements are retained.")) {
      const id = modal.student.id;
      update((x) => ({ ...x, students: x.students.filter((s) => s.id !== id), lockedStudents: x.lockedStudents.filter((s) => s !== id), currentAssignment: Object.fromEntries(Object.entries(x.currentAssignment || {}).map(([tid, ids]) => [tid, ids.map((s) => s === id ? null : s)])) }));
      setModal(null);
    }
  }} />}
 {modal === "class" && <div className="dialog-stack"><button onClick={() => setModal({ naming: "rename" })}>Rename class</button><button onClick={() => {
    const nc = { ...S.clone(c), id: S.id(), name: c.name + " copy", seatingHistory: [] };
    commit((d) => ({ ...d, classes: [...d.classes, nc], activeClassId: nc.id }));
    setModal(null);
  }}>Duplicate class with roster</button><button onClick={() => {
    const nc = { ...S.makeClass(c.name + " layout"), room: S.roomSize(c), tables: S.clone(c.tables), screen: S.clone(c.screen), furniture: S.clone(c.furniture) };
    commit((d) => ({ ...d, classes: [...d.classes, nc], activeClassId: nc.id }));
    setModal(null);
  }}>Duplicate layout only</button><button onClick={() => {
    update((x) => ({ ...x, archived: !x.archived }));
    setModal(null);
  }}> {c.archived ? "Restore" : "Archive"} class</button></div>}
 {modal === "random" && <><p>Review before applying. Locked students and keep-apart restrictions are respected.</p><Chart c={{ ...c, currentAssignment: preview }} prefs={prefs} view="grid" readOnly /><div className="button-row"><button onClick={previewRandom}>Try another</button><button className="primary" onClick={() => {
    saveArrangement(preview, "Randomized arrangement");
    setModal(null);
    setPreview(null);
  }}>Apply arrangement</button></div></>}
 {modal === "export" && <div className="dialog-stack"><label><input type="checkbox" checked={outputGender} onChange={(e) => setOutputGender(e.target.checked)} /> Include gender in this output only</label><button onClick={exportChart}>Download seating CSV</button><button onClick={() => {
    setTab("Seats");
    setView("grid");
    setModal(null);
    setTimeout(print, 100);
  }}>Print chart / Save PDF</button><p className="muted">Notes never appear in printed charts or seating exports.</p></div>}
 {modal === "import" && <ImportStudents onImport={(students) => {
    update((x) => ({ ...x, students: [...x.students, ...students] }));
    setModal(null);
  }} />}
 {modal === "sheets" && <SheetsImport demo={demo} user={user} onImport={(roster) => {
    const nc = S.makeClass(roster.code);
    nc.students = roster.students.map((name) => S.student({ id: S.id(), name }));
    commit((d) => ({ ...d, classes: [...d.classes, nc], activeClassId: nc.id }));
    setModal(null);
  }} />}
 {modal === "share" && <SharePanel c={c} user={user} demo={demo} includeGender={outputGender} setIncludeGender={setOutputGender} />}
 {modal === "room" && <RoomDesigner c={c} update={update} onApplied={() => {setSelected(null);setZoom(1);setModal(null);}} />}
 {modal === "help" && <div className="help-text"><p>Select a student in the roster, then select a seat. Selecting an occupied seat swaps students. This works with a mouse, touch, or keyboard.</p><p>Drag a table by its header. Select a table and use arrow keys to move it. Use the table controls to rotate, duplicate or delete.</p><p>Use the zoom buttons and scroll the workspace to pan. Undo with ⌘Z or Ctrl+Z; redo with Shift.</p><p>Randomize shows a preview. History preserves saved arrangements. Templates copy only the layout.</p><p>Gender colors start off. Notes stay private. Sharing requires verified Faculty access and expires after seven days.</p>{demo && <p><strong>This demo uses fictional data and does not save changes.</strong></p>}</div>}
 </Dialog>}
 </div>;
}
function Chart({ c, prefs, view = "room", zoom = 1, selected, setSelected = () => {
}, update = () => {
}, picked, place = () => {
}, startStudentDrag = () => {
}, readOnly = false }) {
  const drag = useRef(null);
  const a = c.currentAssignment || {};
  const room = S.roomSize(c);
  const dim = (t) => S.tableDimensions(c,t);
  const move = (t, x, y) => update(c2 => ({...c2,tables:c2.tables.map(q=>q.id===t.id ? S.boundTable(c2,q,x,y):q)}));
  const start = (e, t) => {
    if (readOnly) return;
    setSelected(t.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: t.x, oy: t.y, el: e.currentTarget.closest(".classroom-table"), t };
  };
  const end = (e) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)<2) {drag.current=null;return;}
    move(d.t, Math.round(d.ox + (e.clientX - d.x) / zoom), Math.round(d.oy + (e.clientY - d.y) / zoom));
    drag.current = null;
  };
  const seat = (t, i) => {
    const s = c.students.find((s2) => s2.id === a[t.id]?.[i]);
    const locked = c.lockedStudents?.includes(s?.id);
    return <button key={i} className={"seat " + (s ? "occupied" : "empty") + (picked && s?.id === picked ? " picked" : "")} style={{ "--output-gender-color": s?.gender ? prefs.genderColors?.[s.gender] || "#657789" : "#657789", "--gender-color": prefs.showGender && s?.gender ? prefs.genderColors?.[s.gender] || "#657789" : "#657789" }} aria-label={`${t.label}, seat ${i + 1}: ${s ? S.display(s, "full") : "empty"}${locked ? ", locked" : ""}`} disabled={readOnly} data-table-id={t.id} data-seat-index={i} onPointerDown={(e) => {
      e.stopPropagation();
      if (!readOnly && s) startStudentDrag(e, s.id);
    }} draggable={false} onDragStart={(e) => {
      e.stopPropagation();
      e.dataTransfer.setData("text/plain", s.id);
    }} onDragOver={(e) => {
      if (!readOnly) e.preventDefault();
    }} onDrop={(e) => {
      e.preventDefault();
      if (!readOnly) place(t.id, i, e.dataTransfer.getData("text/plain"));
    }} onClick={() => !readOnly && place(t.id, i)}><span>{s ? S.display(s, prefs.nameStyle) : "\uFF0B"}</span>{locked && <small>Locked</small>}</button>;
  };
  if (view === "list") return <div className="list-view"><table><thead><tr><th>Table</th><th>Seat</th><th>Student</th><th className="no-print">Assignment</th></tr></thead><tbody>{c.tables.flatMap((t) => Array.from({ length: t.seats }, (_, i) => <tr key={t.id + i}><td>{t.label}</td><td>{i + 1}</td><td>{S.display(c.students.find((s) => s.id === a[t.id]?.[i]), prefs.nameStyle)}</td><td className="no-print">{!readOnly && <button onClick={() => place(t.id, i)}>{picked ? "Place selected student" : "Select student"}</button>}</td></tr>))}</tbody></table></div>;
  return <div className={view === "room" ? "room-scroll" : "grid-scroll"} style={view === "room" ? { width: room.width * zoom, height: room.height * zoom } : void 0}><div className={view === "room" ? "room-surface" : "grid-surface"} style={view === "room" ? { width: room.width, height: room.height, transform: `scale(${zoom})`, transformOrigin: "top left" } : void 0}>
 {view === "room" && <><div className="whiteboard" style={{ left: c.screen?.x ?? 300, top: c.screen?.y ?? 8, width: c.screen?.orientation === "V" ? 30 : 200, height: c.screen?.orientation === "V" ? 200 : 30, writingMode: c.screen?.orientation === "V" ? "vertical-rl" : "horizontal-tb" }}>{c.screen?.label || "FRONT OF CLASSROOM"}</div><div className="room-plant plant-left" aria-hidden="true">🪴</div><div className="room-plant plant-right" aria-hidden="true">🪴</div>{(c.furniture || []).map((f) => <div key={f.id} className="furniture" style={{ left: f.x, top: f.y, width:f.width, height:f.height, background:f.type === "note" ? "#fff9cf" : undefined }}>{{ plant: "\u{1FAB4}", clock: "\u25F7", door: "\u{1F6AA}", window: "\u{1FA9F}", sink: "\u{1F6B0}", teacherDesk: "Teacher\u2019s desk" }[f.type] || f.label || f.type}</div>)}</>}
 {c.tables.map((t) => {
    const [w, h] = dim(t);
    return <article key={t.id} className={"classroom-table shape-" + (t.shape || "rectangle") + " " + (selected === t.id ? "selected" : "")} style={view === "room" ? { left: t.x, top: t.y, width: w, height: h } : void 0}><button className="table-handle" aria-label={`Move ${t.label}`} disabled={readOnly} onPointerDown={view === "room" ? (e) => start(e, t) : void 0} onPointerMove={(e) => {
      const d = drag.current;
      if (d && d.t.id === t.id) {
        d.el.style.left = d.ox + (e.clientX - d.x) / zoom + "px";
        d.el.style.top = d.oy + (e.clientY - d.y) / zoom + "px";
      }
    }} onPointerUp={end} onPointerCancel={() => {
      const d = drag.current;
      if (d) {
        d.el.style.left = d.ox + "px";
        d.el.style.top = d.oy + "px";
      }
      drag.current = null;
    }} onClick={() => setSelected(t.id)} onKeyDown={(e) => {
      const offsets = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
      if (offsets[e.key] && !readOnly) {
        e.preventDefault();
        move(t, t.x + offsets[e.key][0], t.y + offsets[e.key][1]);
      }
    }}>{t.label}<span>⠿</span></button><div className="seat-grid" style={{ gridTemplateColumns: t.seats === 1 ? "1fr" : "repeat(2,minmax(0,1fr))" }}>{Array.from({ length: t.seats }, (_, i) => seat(t, i))}</div></article>;
  })}
 {!c.tables.length && <p className="empty-room">Add a table or individual seat to begin.</p>}
 </div></div>;
}
function TableEditor({ table: t, change, remove, duplicate }) {
  if (!t) return null;
  return <div className="table-editor no-print"><label>Table name<input aria-label="Table name" value={t.label} onChange={(e) => change((t2) => ({ ...t2, label: e.target.value }))} /></label><label>Shape<select aria-label="Table shape" value={t.shape || "rectangle"} onChange={e=>change(q=>({...q,shape:e.target.value}))}>{["rectangle","round","oval"].map(v=><option key={v}>{v}</option>)}</select></label><label>Width<input aria-label="Table width" type="number" min="100" max="400" value={t.width || 190} onChange={e=>change(q=>({...q,width:Math.max(100,Math.min(400,+e.target.value))}))}/></label><label>Depth<input aria-label="Table depth" type="number" min="90" max="300" value={t.height || 114} onChange={e=>change(q=>({...q,height:Math.max(90,Math.min(300,+e.target.value))}))}/></label><label>Seats<select aria-label="Table seats" value={t.seats} onChange={async (e) => {
    const n = +e.target.value;
    if (n < t.seats && !await confirmAction("Reduce seats? Students in removed seats will become unassigned. You can undo this change.")) return;
    change((t2) => ({ ...t2, seats: n }));
  }}>{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n}>{n}</option>)}</select></label><button onClick={() => change((t2) => ({ ...t2, orientation: t2.orientation === "H" ? "V" : "H" }))}>Rotate</button><button onClick={duplicate}>Duplicate</button><button className="danger" onClick={remove}>Delete</button></div>;
}
function StudentForm({ prefs, student, save, remove }) {
  return <form onSubmit={(e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const s = { ...student || { id: S.id() }, ...f, name: [f.firstName.trim(), f.lastName.trim()].filter(Boolean).join(" ") };
    if (!s.name) return;
    save(S.student(s));
  }}><div className="form-columns"><label>First name<input name="firstName" required autoFocus defaultValue={student?.firstName || ""} /></label><label>Last name<input name="lastName" defaultValue={student?.lastName || ""} /></label></div><label>Preferred / display name<input name="preferredName" defaultValue={student?.preferredName || ""} /></label><label>Gender (optional)<select name="gender" defaultValue={student?.gender || ""}><option value="">Unspecified / remove information</option>{Object.entries(prefs.genderLabels || { F: "Female", M: "Male", NB: "Nonbinary", X: "Other / self-described" }).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Private notes<textarea name="notes" rows="3" defaultValue={student?.notes || ""} /></label><p className="muted">Only your account can read these notes. They are omitted from shared charts and exports.</p><div className="button-row"><button className="primary">Save student</button>{student && <button type="button" className="danger" onClick={remove}>Remove student</button>}</div></form>;
}
function ImportStudents({ onImport }) {
  const [text, setText] = useState(""), [error, setError] = useState(""), [preview, setPreview] = useState(null);
  return <><p>Use headers: First name, Last name, Preferred name, Gender. Only a name is required. Existing students are preserved.</p><input type="file" accept=".csv,text/csv" aria-label="Choose CSV file" onChange={async (e) => {
    const f = e.target.files[0];
    if (f) {
      setText(await f.text());
      setPreview(null);
    }
  }} /><textarea aria-label="CSV content" rows="7" value={text} placeholder={"First name,Last name\nAlex,Rivera"} onChange={(e) => {
    setText(e.target.value);
    setPreview(null);
  }} />{error && <p role="alert">{error}</p>}{preview && <p>{preview.length} students ready: {preview.slice(0, 5).map((s) => s.name).join(", ")}</p>}<button className="primary" disabled={!text.trim()} onClick={() => {
    try {
      if (preview) onImport(preview);
      else {
        setPreview(S.importCSV(text));
        setError("");
      }
    } catch (e) {
      setError(e.message);
    }
  }}>{preview ? "Add students" : "Preview import"}</button></>;
}
function SheetsImport({ demo, user, onImport }) {
  const [rosters, setRosters] = useState([]), [status, setStatus] = useState("");
  return <><p>Import a class from the existing school roster spreadsheet. Google will request read-only Sheets access for your school account.</p><button disabled={demo || status === "Loading\u2026"} onClick={async () => {
    setStatus("Loading\u2026");
    try {
      const token = await getSheetsToken(user.email);
      const rows = await fetchAllRosters(token);
      setRosters(rows);
      setStatus(rows.length ? "Choose a class" : "No matching roster tabs found.");
    } catch (e) {
      setStatus(e.message);
    }
  }}>Connect school Google Sheets</button><p role="status">{demo ? "School imports are disabled in the fictional demo." : status}</p>{rosters.map((r, i) => <button className="roster-choice" key={i} onClick={() => onImport(r)}>{r.code} · {r.teacher} · {r.students.length} students</button>)}</>;
}
function Settings({ c, update, prefs, setPref, onNewCategory }) {
  const [a, setA] = useState(""), [b, setB] = useState("");
  return <section className="content-panel settings"><h2>Classroom settings</h2><h3>Seating restrictions</h3><p>Locks preserve exact seats. Excluded students remain in the roster but are not randomized.</p>{c.students.map((s) => <div className="restriction-row" key={s.id}><span>{S.display(s, "full")}</span><label><input type="checkbox" checked={c.lockedStudents.includes(s.id)} disabled={!S.locate(c.currentAssignment, s.id) && !c.lockedStudents.includes(s.id)} onChange={(e) => update((x) => ({ ...x, lockedStudents: e.target.checked ? [...x.lockedStudents, s.id] : x.lockedStudents.filter((id) => id !== s.id) }))} /> Locked</label><label><input type="checkbox" checked={c.constraints.excludedStudents.includes(s.id)} onChange={(e) => update((x) => ({ ...x, constraints: { ...x.constraints, excludedStudents: e.target.checked ? [...x.constraints.excludedStudents, s.id] : x.constraints.excludedStudents.filter((id) => id !== s.id) } }))} /> Excluded</label></div>)}<h3>Keep apart</h3><div className="button-row">{[[a, setA, "First student"], [b, setB, "Second student"]].map(([v, set, label]) => <select key={label} aria-label={label} value={v} onChange={(e) => set(e.target.value)}><option value="">{label}</option>{c.students.map((s) => <option key={s.id} value={s.id}>{S.display(s, "full")}</option>)}</select>)}<button disabled={!a || !b || a === b} onClick={() => {
    update((x) => ({ ...x, constraints: { ...x.constraints, keepApart: [...x.constraints.keepApart, [a, b]] } }));
    setA("");
    setB("");
  }}>Add restriction</button></div>{c.constraints.keepApart.map((pair, i) => {
    const p = Array.isArray(pair) ? pair : [pair.a, pair.b];
    return <div className="history-row" key={i}><span>{p.map((id) => S.display(c.students.find((s) => s.id === id), "full")).join(" \u2194 ")}</span><button onClick={() => update((x) => ({ ...x, constraints: { ...x.constraints, keepApart: x.constraints.keepApart.filter((_, j) => j !== i) } }))}>Remove</button></div>;
  })}<h3>Gender preferences</h3><p>Only used when “Show gender colors” is enabled. Unspecified students stay neutral.</p><label>Arrangement preference<select disabled={!prefs.showGender} value={c.constraints.genderMode} onChange={(e) => update((x) => ({ ...x, constraints: { ...x.constraints, genderMode: e.target.value } }))}><option value="mixed">No gender preference</option><option value="together">Same categories together</option><option value="alternating">Alternate female and male where possible</option></select></label>{Object.entries(prefs.genderLabels || { F: "Female", M: "Male", NB: "Nonbinary", X: "Other / self-described" }).map(([key, label]) => <label className="color-option" key={key}><input aria-label={"Category label " + key} value={label} onChange={(e) => setPref("genderLabels", { ...prefs.genderLabels || { F: "Female", M: "Male", NB: "Nonbinary", X: "Other / self-described" }, [key]: e.target.value })} /><input aria-label={"Color for " + label} type="color" value={prefs.genderColors?.[key] || S.colors[key] || "#657789"} onChange={(e) => setPref("genderColors", { ...prefs.genderColors, [key]: e.target.value })} /></label>)}<button onClick={onNewCategory}>Add optional category</button><h3>Room furniture</h3><div className="button-row">{[["plant", "Plant"], ["teacherDesk", "Teacher desk"], ["door", "Door"], ["window", "Window"], ["clock", "Clock"], ["sink", "Sink"]].map(([type, label]) => <button key={type} onClick={() => update((x) => ({ ...x, furniture: [...x.furniture, { id: S.id(), type, x: 380, y: 40 }] }))}>Add {label}</button>)}</div>{c.furniture.map((f) => <div className="history-row" key={f.id}><span>{f.type}</span><div className="button-row">{[["\u2190", -10, 0], ["\u2192", 10, 0], ["\u2191", 0, -10], ["\u2193", 0, 10]].map(([label, dx, dy]) => <button key={label} aria-label={`Move ${f.type} ${label}`} onClick={() => update((x) => ({ ...x, furniture: x.furniture.map((q) => q.id === f.id ? { ...q, x: Math.max(0, Math.min(780, q.x + dx)), y: Math.max(0, Math.min(470, q.y + dy)) } : q) }))}>{label}</button>)}<button onClick={async () => {
    if (await confirmAction("Remove this furniture?")) update((x) => ({ ...x, furniture: x.furniture.filter((q) => q.id !== f.id) }));
  }}>Remove</button></div></div>)}<h3>Front of classroom</h3><button onClick={() => update((x) => ({ ...x, screen: { ...x.screen, orientation: x.screen.orientation === "H" ? "V" : "H" } }))}>Rotate room marker</button><div className="button-row">{[["Left", -10, 0], ["Right", 10, 0], ["Up", 0, -10], ["Down", 0, 10]].map(([label, dx, dy]) => <button key={label} onClick={() => update((x) => ({ ...x, screen: { ...x.screen, x: Math.max(0, Math.min(620, x.screen.x + dx)), y: Math.max(0, Math.min(450, x.screen.y + dy)) } }))}>{label}</button>)}</div></section>;
}
function SharePanel({ c, user, demo, includeGender, setIncludeGender }) {
  const [shares, setShares] = useState([]), [message, setMessage] = useState(""), [url, setUrl] = useState("");
  const load = async () => {
    try {
      const snap = await fbDb.collection("sharedViews").where("ownerUid", "==", user.uid).get();
      setShares(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      setMessage(e.message);
    }
  };
  useEffect(() => {
    if (!demo) load();
  }, []);
  return <div className="dialog-stack"><p>Only verified Mark Day Faculty can open a shared chart. Links expire after seven days and can be revoked here. Notes are never included.</p><label><input type="checkbox" checked={includeGender} onChange={(e) => setIncludeGender(e.target.checked)} /> Include gender in this shared view</label><button className="primary" disabled={demo} onClick={async () => {
    try {
      const id = S.id();
      await fbDb.collection("sharedViews").doc(id).set({ ownerUid: user.uid, expiresAt: firebase.firestore.Timestamp.fromMillis(Date.now() + 7 * 864e5), chart: S.snapshot(c, includeGender) });
      setUrl(location.origin + location.pathname + "?share=" + id);
      load();
    } catch (e) {
      setMessage(e.message);
    }
  }}>Create view-only link</button>{url && <label>Share this link<input readOnly value={url} onFocus={(e) => e.target.select()} /></label>}{demo && <p>Sharing is unavailable in the fictional demo.</p>}{message && <p role="alert">{message}</p>}{shares.map((s) => <div className="history-row" key={s.id}><span>{s.chart.name}<small>Expires {s.expiresAt.toDate().toLocaleDateString()}</small></span><button onClick={async () => {
    try {
      await fbDb.collection("sharedViews").doc(s.id).delete();
      load();
    } catch (e) {
      setMessage(e.message);
    }
  }}>Revoke</button></div>)}</div>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

function RoomDesigner({c,update,onApplied}) {
  const room=S.roomSize(c);
  const [width,setWidth]=useState(room.width),[height,setHeight]=useState(room.height);
  const [kind,setKind]=useState('lab'),[object,setObject]=useState('note'),[label,setLabel]=useState('');
  const screen=(side)=>update(x=>{const r=S.roomSize(x);return {...x,screen:{label:'SCREEN',orientation:['left','right'].includes(side)?'V':'H',x:side==='right'?r.width-65:side==='left'?25:(r.width-200)/2,y:side==='bottom'?r.height-55:side==='top'?20:(r.height-200)/2}};});
  return <div className="dialog-stack"><p>Arrange your space, then drag tables by their headers. All changes support Undo.</p><h3>Classroom layouts</h3><label>Layout preset<select value={kind} onChange={e=>setKind(e.target.value)}><option value="lab">Creativity Lab · six tables · screen right</option><option value="pods">Round table pods</option><option value="rows">Desk rows · 24 seats</option><option value="horseshoe">Horseshoe · open toward screen</option></select></label><button onClick={async()=>{if(await confirmAction('Replace the layout and clear seat assignments? Students remain in your roster. You can Undo this change.')){update(x=>({...x,...S.layoutPreset(kind),tableSize:null,currentAssignment:{},lockedStudents:[]}));onApplied();}}}>Apply layout</button><h3>Room size</h3><p className="muted">Canvas units describe proportions, not measured feet or metres.</p><div className="form-columns"><label>Room width<input type="number" min="600" max="2000" value={width} onChange={e=>setWidth(e.target.value)}/></label><label>Room depth<input type="number" min="400" max="1200" value={height} onChange={e=>setHeight(e.target.value)}/></label></div><button onClick={()=>update(x=>{const next={...x,room:{...x.room,width:Math.max(600,Math.min(2000,+width||1100)),height:Math.max(400,Math.min(1200,+height||600))}};return {...next,tables:next.tables.map(t=>S.boundTable(next,t)),screen:{...next.screen,x:Math.min(next.screen.x,next.room.width-200),y:Math.min(next.screen.y,next.room.height-200)},furniture:next.furniture.map(f=>({...f,x:Math.min(f.x,next.room.width-(f.width||80)),y:Math.min(f.y,next.room.height-(f.height||50))}))};})}>Resize room</button><label><input type="checkbox" checked={!!c.room?.snap} onChange={e=>update(x=>({...x,room:{...S.roomSize(x),snap:e.target.checked}}))}/> Snap table movements to a 10-unit grid</label><h3>Screen position</h3><div className="button-row">{['left','right','top','bottom'].map(side=><button key={side} onClick={()=>screen(side)}>Screen {side}</button>)}</div><h3>Room objects</h3><div className="form-columns"><label>Object<select value={object} onChange={e=>setObject(e.target.value)}>{['note','teacherDesk','door','window','plant','sink','stage','storage'].map(v=><option key={v}>{v}</option>)}</select></label><label>Object label<input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Optional label"/></label></div><button onClick={()=>update(x=>({...x,furniture:[...x.furniture,{id:S.id(),type:object,label:label||object,x:30,y:30,width:object==='stage'?200:100,height:object==='stage'?100:50}]}))}>Add room object</button>{c.furniture.map(f=><div className="object-editor" key={f.id}><strong>{f.label||f.type}</strong>{['x','y','width','height'].map(k=><label key={k}>{k}<input aria-label={`${f.label||f.type} ${k}`} type="number" min="0" max={k==='x'||k==='width'?room.width:room.height} value={f[k]??(k==='width'?100:50)} onChange={e=>{const value=+e.target.value;update(x=>({...x,furniture:x.furniture.map(q=>q.id===f.id?{...q,[k]:Math.max(0,Math.min(k==='x'||k==='width'?room.width:room.height,value))}:q)}));}}/></label>)}<button onClick={()=>update(x=>({...x,furniture:x.furniture.filter(q=>q.id!==f.id)}))}>Remove object</button></div>)}</div>;
}
