(function(root) {
  "use strict";
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const id = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
  const colors = { F: "#b34b79", M: "#386bac", NB: "#7958a5", X: "#4b7b70", "": "#657789" };
  function student(s) {
    const parts = (s.name || "").trim().split(/\s+/);
    return { ...s, firstName: s.firstName ?? parts[0] ?? "", lastName: s.lastName ?? parts.slice(1).join(" "), preferredName: s.preferredName || "", gender: s.gender || "", notes: s.notes || "" };
  }
  function migrate(d) {
    if (!d || !Array.isArray(d.classes)) throw Error("Unrecognized saved data. No changes were saved.");
    return { ...clone(d), version: 2, preferences: { showGender: false, nameStyle: "first", genderColors: colors, ...d.preferences }, templates: d.templates || [], classes: d.classes.map((c) => ({ ...c, students: (c.students || []).map(student), tables: (c.tables || []).map((t) => ({ ...t, seats: Math.max(t.seats || 4, (c.currentAssignment?.[t.id] || []).length) })), furniture: c.furniture || [], seatingHistory: c.seatingHistory || [], constraints: { excludedStudents: [], keepApart: [], genderMode: "mixed", ...c.constraints }, lockedStudents: c.lockedStudents || [], screen: c.screen || { x: 300, y: 8, orientation: "H" } })) };
  }
  function makeClass(name) {
    return { id: id(), name, students: [], tables: Array.from({ length: 6 }, (_, i) => ({ id: id(), label: `Table ${i + 1}`, orientation: "H", seats: 4, x: 60 + i % 3 * 260, y: 70 + Math.floor(i / 3) * 170 })), screen: { x: 300, y: 8, orientation: "H" }, furniture: [], seatingHistory: [], currentAssignment: {}, constraints: { genderMode: "mixed", excludedStudents: [], keepApart: [] }, lockedStudents: [] };
  }
  function display(s, style = "first") {
    if (!s) return "Empty seat";
    const n = s.preferredName || s.firstName || s.name?.split(" ")[0] || "";
    return style === "full" ? [n, s.lastName].filter(Boolean).join(" ") : style === "initial" ? [n, s.lastName ? s.lastName[0] + "." : ""].filter(Boolean).join(" ") : n;
  }
  function locate(a, sid) {
    for (const [tid, ids] of Object.entries(a || {})) {
      const seat = ids.indexOf(sid);
      if (seat >= 0) return { tid, seat };
    }
    return null;
  }
  function assign(c, sid, tid, seat) {
    const t = c.tables.find((t2) => t2.id === tid);
    if (!t || seat < 0 || seat >= t.seats || !c.students.some((s) => s.id === sid)) throw Error("Choose a valid student and seat.");
    const a = clone(c.currentAssignment || {}), from = locate(a, sid);
    const dest = a[tid]?.[seat];
    if ((c.lockedStudents || []).includes(sid) || dest && (c.lockedStudents || []).includes(dest)) throw Error("Unlock the student before changing this seat.");
    if (!a[tid]) a[tid] = Array(t.seats).fill(null);
    while (a[tid].length < t.seats) a[tid].push(null);
    if (from) a[from.tid][from.seat] = dest || null;
    a[tid][seat] = sid;
    return { ...c, currentAssignment: a };
  }
  function randomize(c, showGender = false, rng = Math.random) {
    const excluded = new Set(c.constraints?.excludedStudents || []), active = c.students.filter((s) => !excluded.has(s.id)), valid = new Set(active.map((s) => s.id));
    const locks = new Set(c.lockedStudents || []), pairs = c.constraints?.keepApart || [];
    const seats = c.tables.reduce((n, t) => n + t.seats, 0);
    if (active.length > seats) throw Error(`${active.length} students need ${active.length - seats} more seats.`);
    for (const sid of locks) if (excluded.has(sid)) throw Error("A locked student is also excluded. Resolve this restriction first.");
    for (let attempt = 0; attempt < 500; attempt++) {
      const a = Object.fromEntries(c.tables.map((t) => [t.id, Array(t.seats).fill(null)]));
      let pending = active.filter((s) => !locks.has(s.id));
      for (const sid of locks) {
        if (!valid.has(sid)) continue;
        const p = locate(c.currentAssignment, sid);
        if (!p || !a[p.tid] || p.seat >= a[p.tid].length) throw Error("A locked seat no longer exists. Unlock the student first.");
        a[p.tid][p.seat] = sid;
      }
      for (let i = pending.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [pending[i], pending[j]] = [pending[j], pending[i]];
      }
      const conflict = (ids, sid) => pairs.some((pair) => {
        const [x, y] = Array.isArray(pair) ? pair : [pair.a, pair.b];
        return sid === x && ids.includes(y) || sid === y && ids.includes(x);
      });
      if (Object.values(a).some((ids) => ids.some((sid) => sid && conflict(ids, sid)))) throw Error("Locked students conflict with a keep-apart restriction.");
      let failed = false;
      for (const s of pending) {
        let ts = c.tables.filter((t2) => a[t2.id].includes(null) && !conflict(a[t2.id], s.id));
        ts.sort((x, y) => {
          const score = (t2) => {
            const occupants = a[t2.id].filter(Boolean);
            let v = occupants.length / t2.seats;
            if (showGender && c.constraints?.genderMode === "together" && s.gender) v += occupants.filter((sid) => c.students.find((q) => q.id === sid)?.gender !== s.gender).length * 10;
            return v;
          };
          return score(x) - score(y);
        });
        if (!ts.length) {
          failed = true;
          break;
        }
        const t = ts[0];
        a[t.id][a[t.id].indexOf(null)] = s.id;
      }
      if (!failed) {
        if (showGender && c.constraints?.genderMode === "alternating") for (const t of c.tables) {
          if (a[t.id].some((sid) => locks.has(sid))) continue;
          const ids = a[t.id].filter(Boolean), groups = { M: [], F: [], other: [] };
          ids.forEach((sid) => {
            const g = c.students.find((s) => s.id === sid)?.gender;
            groups[g === "M" || g === "F" ? g : "other"].push(sid);
          });
          const out = [];
          while (groups.M.length || groups.F.length) {
            if (groups.M.length) out.push(groups.M.shift());
            if (groups.F.length) out.push(groups.F.shift());
          }
          out.push(...groups.other);
          a[t.id] = Array.from({ length: t.seats }, (_, i) => out[i] || null);
        }
        return a;
      }
    }
    throw Error("Could not satisfy all seating restrictions. Review keep-apart pairs or add tables.");
  }
  function csvCell(v) {
    let s = String(v ?? "");
    if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function csv(rows) {
    return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  }
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quote = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (quote && text[i + 1] === '"') {
          field += '"';
          i++;
        } else quote = !quote;
      } else if (ch === "," && !quote) {
        row.push(field);
        field = "";
      } else if ((ch === "\n" || ch === "\r") && !quote) {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        if (row.some(Boolean)) rows.push(row);
        row = [];
        field = "";
      } else field += ch;
    }
    if (quote) throw Error("CSV has an unclosed quoted field.");
    row.push(field);
    if (row.some(Boolean)) rows.push(row);
    return rows;
  }
  function importCSV(text) {
    const rows = parseCSV(text);
    if (!rows.length) return [];
    const headers = rows[0].map((x) => x.trim().toLowerCase());
    const known = headers.some((h) => ["name", "first name", "firstname", "student"].includes(h));
    if (known) rows.shift();
    return rows.map((r) => {
      const get = (...names) => {
        const i = headers.findIndex((h) => names.includes(h));
        return i < 0 ? "" : (r[i] || "").trim();
      };
      const first = known ? get("first name", "firstname") : "";
      const last = known ? get("last name", "lastname") : "";
      const name = known ? get("name", "student") || [first, last].filter(Boolean).join(" ") : r[0].trim();
      return student({ id: id(), name, ...first ? { firstName: first, lastName: last } : {}, preferredName: known ? get("preferred name", "display name") : "", gender: known ? get("gender") : "", notes: "" });
    }).filter((s) => s.name);
  }
  function snapshot(c, includeGender = false) {
    return { name: c.name, tables: clone(c.tables), screen: clone(c.screen), furniture: clone(c.furniture || []), currentAssignment: clone(c.currentAssignment || {}), students: c.students.map((s) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName, preferredName: s.preferredName || "", name: s.name, ...includeGender ? { gender: s.gender || "" } : {} })), includeGender };
  }
  const api = { clone, id, colors, student, migrate, makeClass, display, locate, assign, randomize, csv, parseCSV, importCSV, snapshot };
  if (typeof module !== "undefined") module.exports = api;
  else root.Seating = api;
})(globalThis);
