// Orbit.modal - one modal form at a time, built from a field list. app.js
// describes each dialog declaratively; this module owns the DOM, keyboard
// handling (Escape closes, Enter submits), and the error line in the footer.
window.Orbit = window.Orbit || {};

(function () {
  "use strict";

  var current = null; // { overlay, keyHandler }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function close() {
    if (!current) return;
    document.removeEventListener("keydown", current.keyHandler, true);
    current.overlay.remove();
    current = null;
  }

  function isOpen() {
    return current !== null;
  }

  function fieldHtml(field) {
    var id = "modal-field-" + field.key;
    var attrs = ' class="input' + (field.mono ? " input-mono" : "") +
      '" id="' + id + '" name="' + esc(field.key) + '"';
    var html;
    if (field.type === "select") {
      html = "<select" + attrs + ">" + (field.options || []).map(function (opt) {
        return '<option value="' + esc(opt[0]) + '"' +
          (String(field.value) === String(opt[0]) ? " selected" : "") + ">" +
          esc(opt[1]) + "</option>";
      }).join("") + "</select>";
    } else if (field.type === "number") {
      html = "<input" + attrs + ' type="number" step="' +
        (field.step != null ? field.step : "any") + '"' +
        (field.min != null ? ' min="' + field.min + '"' : "") +
        (field.max != null ? ' max="' + field.max + '"' : "") +
        ' value="' + esc(field.value == null ? "" : field.value) + '">';
    } else if (field.type === "datetime") {
      html = "<input" + attrs + ' type="datetime-local" step="1" value="' +
        esc(field.value == null ? "" : field.value) + '">';
    } else if (field.type === "checkbox") {
      html = '<input class="input-check" id="' + id + '" name="' +
        esc(field.key) + '" type="checkbox"' + (field.value ? " checked" : "") + ">";
    } else {
      html = "<input" + attrs + ' type="text" value="' +
        esc(field.value == null ? "" : field.value) + '"' +
        (field.placeholder ? ' placeholder="' + esc(field.placeholder) + '"' : "") + ">";
    }
    return '<label class="form-row" id="modal-row-' + esc(field.key) +
      '"><span class="form-label"' +
      (field.hint ? ' title="' + esc(field.hint) + '"' : "") + ">" +
      esc(field.label) + "</span>" + html + "</label>";
  }

  function readValues(overlay, fields) {
    var values = {};
    fields.forEach(function (field) {
      var el = overlay.querySelector("#modal-field-" + field.key);
      if (field.type === "number") {
        var num = parseFloat(el.value);
        values[field.key] = isFinite(num) ? num : NaN;
      } else if (field.type === "text") {
        values[field.key] = el.value.trim();
      } else if (field.type === "checkbox") {
        values[field.key] = el.checked;
      } else {
        values[field.key] = el.value;
      }
    });
    return values;
  }

  function writeValues(overlay, fields, values) {
    fields.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(values, field.key)) return;
      var el = overlay.querySelector("#modal-field-" + field.key);
      if (!el) return;
      if (field.type === "checkbox") el.checked = !!values[field.key];
      else el.value = values[field.key] == null ? "" : String(values[field.key]);
    });
  }

  // options: { title, submitLabel, fields: [...], onSubmit(values),
  //   preview(values), onChange(values, changedKey, setValues) } - `preview`
  // (optional) returns a live footer line
  // recomputed as the user types (e.g. "12 satellites will be inserted").
  // `onChange` may fill related controls through setValues({ key: value }),
  // which is useful for presets while leaving every generated value editable.
  // onSubmit returns { errors: [...] } to keep the modal open with the errors
  // shown, anything else (or a promise of it) to close. Field spec:
  // { key, label, type: "text"|"number"|"select"|"datetime",
  //   value, options: [[value, label]], min, max, step, mono, hint,
  //   placeholder, visibleWhen(values) }
  // `visibleWhen` (optional) hides the row while it returns false; hidden
  // fields still report their values on submit, so onSubmit decides what to
  // keep (e.g. drop the boresight unless pointing is FixedVector).
  function form(options) {
    close();
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
      '<header class="modal-header"><span>' + esc(options.title) + "</span>" +
      '<button class="modal-close" title="Close (Esc)">&#10005;</button></header>' +
      '<div class="modal-body">' + options.fields.map(fieldHtml).join("") + "</div>" +
      '<footer class="modal-footer">' +
      '<div class="modal-error" id="modal-error"></div>' +
      '<div class="modal-note" id="modal-note"></div>' +
      '<div class="modal-actions">' +
      '<button class="btn" id="modal-cancel">Cancel</button>' +
      '<button class="btn btn-accent" id="modal-submit">' +
      esc(options.submitLabel || "Apply") + "</button></div></footer></div>";

    var errorEl = overlay.querySelector("#modal-error");
    var noteEl = overlay.querySelector("#modal-note");
    var submitBtn = overlay.querySelector("#modal-submit");

    function refreshPreview() {
      if (!options.preview) return;
      var text = "";
      try {
        text = options.preview(readValues(overlay, options.fields)) || "";
      } catch (err) {
        text = err.message || String(err);
      }
      noteEl.textContent = text;
    }

    var hasConditionalFields = options.fields.some(function (field) {
      return typeof field.visibleWhen === "function";
    });

    function refreshVisibility() {
      if (!hasConditionalFields) return;
      var values = readValues(overlay, options.fields);
      options.fields.forEach(function (field) {
        if (typeof field.visibleWhen !== "function") return;
        var row = overlay.querySelector("#modal-row-" + field.key);
        if (row) row.hidden = !field.visibleWhen(values);
      });
    }

    function submit() {
      errorEl.textContent = "";
      submitBtn.disabled = true;
      Promise.resolve(options.onSubmit(readValues(overlay, options.fields)))
        .then(function (result) {
          if (result && result.errors && result.errors.length > 0) {
            submitBtn.disabled = false;
            errorEl.textContent = result.errors.join(" ");
          } else {
            close();
          }
        })
        .catch(function (err) {
          submitBtn.disabled = false;
          errorEl.textContent = err.message || String(err);
        });
    }

    overlay.addEventListener("mousedown", function (ev) {
      if (ev.target === overlay) close();
    });
    overlay.querySelector(".modal-close").addEventListener("click", close);
    overlay.querySelector("#modal-cancel").addEventListener("click", close);
    submitBtn.addEventListener("click", submit);
    if (options.preview || hasConditionalFields || options.onChange) {
      var refreshDynamic = function () {
        refreshVisibility();
        refreshPreview();
      };
      overlay.querySelector(".modal-body").addEventListener("input", refreshDynamic);
      overlay.querySelector(".modal-body").addEventListener("change", function (ev) {
        if (options.onChange) {
          try {
            options.onChange(readValues(overlay, options.fields), ev.target.name,
              function (values) { writeValues(overlay, options.fields, values); });
            errorEl.textContent = "";
          } catch (err) {
            errorEl.textContent = err.message || String(err);
          }
        }
        refreshDynamic();
      });
      refreshDynamic();
    }

    var keyHandler = function (ev) {
      if (ev.key === "Escape") {
        ev.stopPropagation();
        close();
      } else if (ev.key === "Enter" && ev.target.tagName !== "SELECT" &&
                 ev.target.tagName !== "BUTTON") {
        ev.preventDefault();
        submit();
      }
    };
    document.addEventListener("keydown", keyHandler, true);

    current = { overlay: overlay, keyHandler: keyHandler };
    document.body.appendChild(overlay);
    var first = overlay.querySelector(".input");
    if (first) first.focus();
  }

  Orbit.modal = {
    form: form,
    close: close,
    isOpen: isOpen,
  };
})();
