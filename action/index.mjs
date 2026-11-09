var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var WHITESPACE_CHARACTERS = [
      "	",
      "\n",
      "\v",
      "\f",
      "\r",
      " ",
      "\xA0",
      "\u1680",
      "\u2000",
      "\u2001",
      "\u2002",
      "\u2003",
      "\u2004",
      "\u2005",
      "\u2006",
      "\u2007",
      "\u2008",
      "\u2009",
      "\u200A",
      "\u2028",
      "\u2029",
      "\u202F",
      "\u205F",
      "\u3000",
      "\uFEFF"
    ];
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      WHITESPACE_CHARACTERS,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var isPrereleaseIdentifier = (prerelease, identifier) => {
      const identifiers = identifier.split(".");
      if (identifiers.length > prerelease.length) {
        return false;
      }
      for (let i = 0; i < identifiers.length; i++) {
        if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
          return false;
        }
      }
      return true;
    };
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                const prereleaseBase = this.prerelease[identifier.split(".").length];
                if (isNaN(prereleaseBase)) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module) {
    "use strict";
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module) {
    "use strict";
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module) {
    "use strict";
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  }
});

// node_modules/semver/functions/truncate.js
var require_truncate = __commonJS({
  "node_modules/semver/functions/truncate.js"(exports, module) {
    "use strict";
    var parse = require_parse();
    var constants = require_constants();
    var SemVer = require_semver();
    var truncate = (version, truncation, options) => {
      if (!constants.RELEASE_TYPES.includes(truncation)) {
        return null;
      }
      const clonedVersion = cloneInputVersion(version, options);
      return clonedVersion && doTruncation(clonedVersion, truncation);
    };
    var cloneInputVersion = (version, options) => {
      const versionStringToParse = version instanceof SemVer ? version.version : version;
      return parse(versionStringToParse, options);
    };
    var doTruncation = (version, truncation) => {
      if (isPrerelease(truncation)) {
        return version.version;
      }
      version.prerelease = [];
      switch (truncation) {
        case "major":
          version.minor = 0;
          version.patch = 0;
          break;
        case "minor":
          version.patch = 0;
          break;
      }
      return version.format();
    };
    var isPrerelease = (type) => {
      return type.startsWith("pre");
    };
    module.exports = truncate;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports, module) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache;
  }
});

// node_modules/semver/internal/trim-comparator-whitespace.js
var require_trim_comparator_whitespace = __commonJS({
  "node_modules/semver/internal/trim-comparator-whitespace.js"(exports, module) {
    "use strict";
    var {
      MAX_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      WHITESPACE_CHARACTERS
    } = require_constants();
    var whitespace = new Uint8Array(65536);
    for (const char of WHITESPACE_CHARACTERS) {
      whitespace[char.charCodeAt(0)] = 1;
    }
    var isWhitespace = (char) => char !== void 0 && whitespace[char.charCodeAt(0)] === 1;
    var isVersionPrefix = (char) => char === "v" || char === "=" || isWhitespace(char);
    var isDigit = (char) => char !== void 0 && char >= "0" && char <= "9";
    var isLetter = (char) => char !== void 0 && (char >= "a" && char <= "z" || char >= "A" && char <= "Z");
    var isIdentifierCharacter = (char) => isDigit(char) || isLetter(char) || char === "-";
    var isVersionStart = (char) => isDigit(char) || char === "x" || char === "X" || char === "*";
    var findDigitsEndIndex = (range, start, limit, digitRuns) => {
      if (!isDigit(range[start])) {
        return start;
      }
      if (start >= digitRuns.start && start < digitRuns.end) {
        return Math.min(start + limit, digitRuns.end);
      }
      if (start >= digitRuns.previousStart && start < digitRuns.previousEnd) {
        return Math.min(start + limit, digitRuns.previousEnd);
      }
      let end = start + 1;
      while (isDigit(range[end])) {
        end++;
      }
      digitRuns.previousStart = digitRuns.start;
      digitRuns.previousEnd = digitRuns.end;
      digitRuns.start = start;
      digitRuns.end = end;
      return Math.min(start + limit, end);
    };
    var findVersionNumberEndIndex = (range, start, loose, digitRuns) => {
      if (!loose && range[start] === "0") {
        return start + 1;
      }
      return findDigitsEndIndex(range, start, loose ? MAX_LENGTH : MAX_LENGTH + 1, digitRuns);
    };
    var findPrereleaseIdentifierEndIndex = (range, start, loose, digitRuns) => {
      const digitsEnd = findDigitsEndIndex(range, start, MAX_LENGTH, digitRuns);
      if (isLetter(range[digitsEnd]) || range[digitsEnd] === "-") {
        let end = digitsEnd + 1;
        const limit = end + MAX_SAFE_BUILD_LENGTH;
        while (end < limit && isIdentifierCharacter(range[end])) {
          end++;
        }
        return end;
      }
      return findVersionNumberEndIndex(range, start, loose, digitRuns);
    };
    var findPrereleaseEndIndex = (range, start, loose, digitRuns) => {
      const hyphen = range[start] === "-";
      if (!loose && !hyphen) {
        return start;
      }
      const identifierStart = start + (hyphen ? 1 : 0);
      let end = findPrereleaseIdentifierEndIndex(range, identifierStart, loose, digitRuns);
      if (end === identifierStart) {
        if (!loose || !hyphen) {
          return start;
        }
        end = findPrereleaseIdentifierEndIndex(range, start, loose, digitRuns);
      }
      while (range[end] === ".") {
        const next = findPrereleaseIdentifierEndIndex(range, end + 1, loose, digitRuns);
        if (next === end + 1) {
          break;
        }
        end = next;
      }
      return end;
    };
    var findBuildIdentifierEndIndex = (range, start) => {
      let end = start;
      while (end - start < MAX_SAFE_BUILD_LENGTH && isIdentifierCharacter(range[end])) {
        end++;
      }
      return end;
    };
    var findBuildEndIndex = (range, start) => {
      if (range[start] !== "+") {
        return start;
      }
      let end = findBuildIdentifierEndIndex(range, start + 1);
      if (end === start + 1) {
        return start;
      }
      while (range[end] === ".") {
        const next = findBuildIdentifierEndIndex(range, end + 1);
        if (next === end + 1) {
          break;
        }
        end = next;
      }
      return end;
    };
    var findLooseFullVersionEndIndex = (range, start, digitRuns) => {
      let end = start;
      for (let component = 0; component < 3; component++) {
        const next = findVersionNumberEndIndex(range, end, true, digitRuns);
        if (next === end) {
          return start;
        }
        end = next;
        if (component < 2) {
          if (range[end] !== ".") {
            return start;
          }
          end++;
        }
      }
      const prereleaseEnd = findPrereleaseEndIndex(range, end, true, digitRuns);
      return findBuildEndIndex(range, prereleaseEnd);
    };
    var findPartialVersionComponentEndIndex = (range, start, digitRuns) => {
      if (isDigit(range[start])) {
        return findVersionNumberEndIndex(range, start, false, digitRuns);
      }
      return isVersionStart(range[start]) ? start + 1 : start;
    };
    var findPartialVersionEndIndex = (range, start, digitRuns) => {
      let end = findPartialVersionComponentEndIndex(range, start, digitRuns);
      for (let component = 0; component < 2; component++) {
        if (range[end] !== ".") {
          return end;
        }
        const next = findPartialVersionComponentEndIndex(range, end + 1, digitRuns);
        if (next === end + 1) {
          return end;
        }
        end = next;
      }
      const prereleaseEnd = findPrereleaseEndIndex(range, end, false, digitRuns);
      return findBuildEndIndex(range, prereleaseEnd);
    };
    var findVersionEndIndex = (range, start, digitRuns) => {
      const fullVersionEnd = findLooseFullVersionEndIndex(range, start, digitRuns);
      return fullVersionEnd !== start ? fullVersionEnd : findPartialVersionEndIndex(range, start, digitRuns);
    };
    var findRemovableWhitespaceIndex = (range, matchStart) => {
      let position = matchStart;
      if (isWhitespace(range[position])) {
        position++;
      }
      if (range[position] === "<" || range[position] === ">") {
        position++;
      }
      if (range[position] === "=") {
        position++;
      }
      return isWhitespace(range[position]) ? position : -1;
    };
    var trimComparatorWhitespace = (range) => {
      let result = "";
      let copyFrom = 0;
      let cursor = 0;
      const digitRuns = { start: -1, end: -1, previousStart: -1, previousEnd: -1 };
      while (cursor < range.length) {
        const matchStart = cursor;
        if (range[cursor] === "<" || range[cursor] === ">") {
          cursor++;
        } else if (!isVersionPrefix(range[cursor]) && !isVersionStart(range[cursor])) {
          cursor++;
          continue;
        }
        while (cursor < range.length && isVersionPrefix(range[cursor])) {
          cursor++;
        }
        if (!isVersionStart(range[cursor])) {
          continue;
        }
        const whitespacePosition = findRemovableWhitespaceIndex(range, matchStart);
        if (whitespacePosition !== -1) {
          result += range.slice(copyFrom, whitespacePosition);
          copyFrom = whitespacePosition + 1;
        }
        cursor = findVersionEndIndex(range, cursor, digitRuns);
      }
      return result + range.slice(copyFrom);
    };
    module.exports = trimComparatorWhitespace;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        range = range.replace(BUILDSTRIPRE, "");
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = trimComparatorWhitespace(range);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var trimComparatorWhitespace = require_trim_comparator_whitespace();
    var {
      safeRe: re,
      src,
      t,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        if (invalidXRangeOrder(M, m, p)) {
          return comp;
        }
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module) {
    "use strict";
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var satisfies2 = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module.exports = satisfies2;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module) {
    "use strict";
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies2 = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies2(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module) {
    "use strict";
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module) {
    "use strict";
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module) {
    "use strict";
    var satisfies2 = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies2(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module) {
    "use strict";
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies2 = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies2(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies2(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies2(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !c.test(gt.semver)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !c.test(lt.semver)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module) {
    "use strict";
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var truncate = require_truncate();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies2 = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      truncate,
      Comparator,
      Range,
      satisfies: satisfies2,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// src/action/main.ts
import { mkdirSync, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { dirname, isAbsolute, join as join4, relative, resolve, sep } from "node:path";

// src/fix.ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
var overlaps = (a, b) => {
  if (a.start === a.end || b.start === b.end) return a.start > b.start && a.start < b.end || b.start > a.start && b.start < a.end;
  return a.start < b.end && b.start < a.end;
};
var same = (a, b) => a.start === b.start && a.end === b.end && a.text === b.text;
function planFixes(texts, findings) {
  const byFile = /* @__PURE__ */ new Map();
  for (const f of findings) if (f.edits?.length) byFile.set(f.file, [...byFile.get(f.file) ?? [], f]);
  const result = [];
  for (const [file, list] of byFile) {
    const before = texts.get(file);
    if (before === void 0) continue;
    const accepted = [];
    const applied = [];
    const skipped = [];
    for (const f of list) {
      const fresh = f.edits.filter((e) => !accepted.some((a) => same(a, e)));
      if (fresh.some((e) => accepted.some((a) => overlaps(a, e)))) {
        skipped.push(f);
        continue;
      }
      accepted.push(...fresh);
      applied.push(f);
    }
    const after = applyEdits(before, accepted);
    if (after !== before) result.push({ file, before, after, applied, skipped });
  }
  return result.sort((a, b) => a.file.localeCompare(b.file));
}
function applyEdits(text, edits) {
  const isInsert = (e) => e.start === e.end ? 1 : 0;
  const sorted = [...edits].sort((a, b) => b.start - a.start || isInsert(a) - isInsert(b) || (b.order ?? 0) - (a.order ?? 0));
  let out = text;
  for (const e of sorted) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}
function writeFixes(root, fixes) {
  for (const f of fixes) writeFileSync(join(root, f.file), f.after);
}
function unifiedDiff(file, before, after, context = 3) {
  const a = before.split("\n");
  const b = after.split("\n");
  const ops = diffLines(a, b);
  const out = [`--- a/${file}`, `+++ b/${file}`];
  let i = 0;
  while (i < ops.length) {
    if (ops[i].kind === "=") {
      i++;
      continue;
    }
    const start = Math.max(0, i - context);
    let end = i;
    for (let j = i; j < ops.length; j++) {
      if (ops[j].kind !== "=") end = j;
      else if (j - end > context * 2) break;
    }
    end = Math.min(ops.length - 1, end + context);
    const hunk = ops.slice(start, end + 1);
    const aStart = hunk[0].ai + 1;
    const bStart = hunk[0].bi + 1;
    const aLen = hunk.filter((o) => o.kind !== "+").length;
    const bLen = hunk.filter((o) => o.kind !== "-").length;
    out.push(`@@ -${aLen ? aStart : aStart - 1},${aLen} +${bLen ? bStart : bStart - 1},${bLen} @@`);
    for (const o of hunk) out.push(`${o.kind === "=" ? " " : o.kind}${o.text}`);
    i = end + 1;
  }
  return out.join("\n");
}
function diffLines(a, b) {
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;
  const am = a.slice(head, a.length - tail);
  const bm = b.slice(head, b.length - tail);
  const n = am.length;
  const m = bm.length;
  const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i2 = n - 1; i2 >= 0; i2--) for (let j2 = m - 1; j2 >= 0; j2--) lcs[i2][j2] = am[i2] === bm[j2] ? lcs[i2 + 1][j2 + 1] + 1 : Math.max(lcs[i2 + 1][j2], lcs[i2][j2 + 1]);
  const ops = [];
  for (let k = 0; k < head; k++) ops.push({ kind: "=", text: a[k], ai: k, bi: k });
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && am[i] === bm[j]) {
      ops.push({ kind: "=", text: am[i], ai: head + i, bi: head + j });
      i++;
      j++;
    } else if (i < n && (j === m || lcs[i + 1][j] >= lcs[i][j + 1])) {
      ops.push({ kind: "-", text: am[i], ai: head + i, bi: head + j });
      i++;
    } else {
      ops.push({ kind: "+", text: bm[j], ai: head + i, bi: head + j });
      j++;
    }
  }
  for (let k = 0; k < tail; k++) ops.push({ kind: "=", text: a[a.length - tail + k], ai: a.length - tail + k, bi: b.length - tail + k });
  return ops;
}

// src/rules.ts
var REL26 = "https://nodejs.org/en/blog/release/v26.0.0";
var DEPS = "https://nodejs.org/api/deprecations.html";
var COREPACK_COMMIT = "https://github.com/nodejs/node/commit/f31c88021b5b815bf776066c8eca510696b8c744";
var YARN_IMAGE = "https://github.com/nodejs/docker-node#yarn-v1-classic-bundling";
var DOCKER_LTS = "https://github.com/nodejs/docker-node#nodelts";
var SETUP_NODE_CACHE = "https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-data";
var SETUP_NODE_V5 = "https://github.com/actions/setup-node#breaking-changes-in-v5";
var NPM_ENGINES = "https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines";
var TS_DOCS = "https://nodejs.org/api/typescript.html#modules-typescript";
var COREPACK_PIN = "0.36.0";
var YARN1_PIN = "1.22.22";
var RULES = [
  {
    id: "corepack-not-bundled",
    severity: "error",
    title: "`corepack` runs on Node 25+, which no longer ships it",
    why: "Node.js 25.0.0 stopped distributing Corepack (nodejs/node f31c88021b, TSC vote nodejs/TSC#1697), so `corepack enable` fails with `corepack: not found` on node:lts, node:26, lts/* and setup-node 26.",
    fix: `Install it from npm first: \`npm install -g corepack@${COREPACK_PIN} && corepack enable\`, or install the package manager itself (pnpm/action-setup, \`npm install -g pnpm@<version>\`).`,
    source: COREPACK_COMMIT,
    fixable: true
  },
  {
    id: "yarn-not-in-node26-image",
    severity: "error",
    title: "`yarn` runs in a node:26 image, which no longer bundles Yarn 1",
    why: "docker-node: Yarn v1 is not bundled into node images as of Node.js 26.0.0, so node:lts, node:26 and node:lts-alpine have no `yarn` until you install it.",
    fix: `Install Yarn 1 first (\`npm install -g yarn@${YARN1_PIN}\`), or for Yarn 2+ install corepack and run \`corepack enable\`.`,
    source: YARN_IMAGE,
    fixable: true
  },
  {
    id: "package-manager-not-installed",
    severity: "warning",
    title: "`packageManager` names pnpm or Yarn, but nothing installs it before it runs",
    why: "Without Corepack, nothing reads the `packageManager` field on Node 25+: official node images only ship npm, so `pnpm` is not on PATH, and a global Yarn 1 refuses to run a project whose packageManager is Yarn 2+.",
    fix: "Install the exact version from `packageManager` before the first use (`npm install -g pnpm@<version>`, or pnpm/action-setup in GitHub Actions).",
    source: COREPACK_COMMIT,
    fixable: true
  },
  {
    id: "setup-node-cache-before-pm",
    severity: "error",
    title: "setup-node caches pnpm/Yarn before that package manager is installed",
    why: "setup-node asks the package manager for its store path while it restores the cache, so `cache: pnpm` fails with `Unable to locate executable file: pnpm` unless pnpm is installed in an earlier step (setup-node docs put pnpm/action-setup first).",
    fix: "Move pnpm/action-setup (or `npm install -g pnpm@<version>`) above actions/setup-node, or drop the `cache` input.",
    source: SETUP_NODE_CACHE,
    fixable: false
  },
  {
    id: "setup-node-v5-auto-cache",
    severity: "warning",
    title: "setup-node v5 turns on caching by itself for the `packageManager` in package.json",
    why: "setup-node v5 enabled caching by default with package manager detection; with `packageManager: pnpm@\u2026` and no pnpm installed yet, the setup step fails the same way. v6 limits automatic caching to npm.",
    fix: "Install pnpm before setup-node, set `package-manager-cache: false`, or move to actions/setup-node@v6 or later.",
    source: SETUP_NODE_V5,
    fixable: false
  },
  {
    id: "removed-transform-types-flag",
    severity: "error",
    title: "`--experimental-transform-types` was removed in Node 26",
    why: "Node.js 26.0.0 removed the flag (89f4b6cddb, #61803). Node 26 exits with `bad option: --experimental-transform-types` (or `is not allowed in NODE_OPTIONS`). Type stripping stays on by default but only handles erasable syntax.",
    fix: "Drop the flag. Code with enums, namespaces or parameter properties needs a build step (tsc) or a loader such as tsx.",
    source: TS_DOCS,
    fixable: false
  },
  {
    id: "floating-node-version",
    severity: "note",
    title: "A floating Node version (node:lts, lts/*, latest) moved to 26 on 2026-10-28",
    why: "node:lts and lts/* follow the Active LTS line, which became Node 26 with 26.13.0 on 2026-10-28; latest, current and bare variants like node:alpine follow the Current line. The next move happens without a commit.",
    fix: "Pin a major (node:26-alpine, node-version: 26) and upgrade on purpose. `--fix --pin 26` rewrites the tag.",
    source: DOCKER_LTS,
    fixable: true
  },
  {
    id: "engines-exclude-node26",
    severity: "warning",
    title: "`engines.node` does not allow the Node the repo runs on",
    why: "npm warns EBADENGINE when the running Node is outside `engines.node`, and installs fail outright with engine-strict (and in Yarn 1). A range like `^20 || ^22` or `<25` rules out Node 26.",
    fix: "Add 26 to the range (for example `^22 || ^24 || >=26`) once the tests pass on 26.",
    source: NPM_ENGINES,
    fixable: false
  },
  {
    id: "node-version-mismatch",
    severity: "warning",
    title: "The repo pins one Node major, a Dockerfile or CI job runs another",
    why: "The .nvmrc / .node-version / volta pin is what developers test on; a node:lts image or an lts/* job moved to 26 on its own, so CI and production now run a major nobody tested locally.",
    fix: "Pin the image or job to the same major, or move the pin to 26 after testing.",
    source: DOCKER_LTS,
    fixable: false
  },
  {
    id: "dependency-engines-exclude-node26",
    severity: "note",
    title: "Locked dependencies declare engines that leave out Node 26",
    why: "These packages' own `engines.node` ranges exclude 26.13.0; npm prints EBADENGINE for each one and engine-strict installs fail.",
    fix: "Update them to releases that allow Node 26, or check that they work on 26 and keep the warning.",
    source: NPM_ENGINES,
    fixable: false
  },
  {
    id: "native-addon-rebuild",
    severity: "note",
    title: "Native addons must be rebuilt or have prebuilt binaries for NODE_MODULE_VERSION 147",
    why: "Node.js 26 moved NODE_MODULE_VERSION to 147 (75c3bcc3ec); Node 24 is 137 and Node 22 is 127. A compiled addon from an older major fails to load with `was compiled against a different Node.js version`.",
    fix: "Run `npm rebuild` (or reinstall) on Node 26, make sure each addon ships prebuilt binaries for Node 26 or the image has python3, make and g++ for node-gyp.",
    source: REL26,
    fixable: false
  },
  {
    id: "node-modules-cache-key",
    severity: "warning",
    title: "node_modules is cached with a key that ignores the Node version",
    why: "Native addons in node_modules are built for one NODE_MODULE_VERSION (147 on Node 26). When lts/* moves, a cache key without the Node version restores modules built for the old ABI.",
    fix: "Put the Node version in the key (`${{ runner.os }}-node${{ steps.setup.outputs.node-version }}-${{ hashFiles('**/package-lock.json') }}`) or cache the package manager store instead (setup-node `cache:`).",
    source: REL26,
    fixable: false
  },
  {
    id: "dep0193-stream-internals",
    severity: "error",
    dep: "DEP0193",
    title: "`require('_stream_*')` modules were removed in Node 26",
    why: "Node.js 26.0.0 moved DEP0193 (and DEP0125 for _stream_wrap) to End-of-Life: _stream_readable, _stream_writable, _stream_duplex, _stream_transform, _stream_passthrough and _stream_wrap are gone.",
    fix: "Import from `node:stream` instead: `require('node:stream').Readable`, `import { Transform } from 'node:stream'`.",
    source: `${DEPS}#dep0193-requirenode_stream_`,
    fixable: false
  },
  {
    id: "dep0063-writeheader",
    severity: "error",
    dep: "DEP0063",
    title: "`response.writeHeader()` was removed in Node 26",
    why: "Node.js 26.0.0 moved DEP0063 to End-of-Life: ServerResponse.prototype.writeHeader() is gone, so the call throws `writeHeader is not a function`.",
    fix: "Call `response.writeHead()` instead (same arguments).",
    source: `${DEPS}#dep0063-serverresponseprototypewriteheader`,
    fixable: false
  },
  {
    id: "dep0030-slowbuffer",
    severity: "error",
    dep: "DEP0030",
    title: "`SlowBuffer` was removed in Node 25",
    why: "Node.js 25.0.0 moved DEP0030 to End-of-Life: the SlowBuffer class has been removed.",
    fix: "Use `Buffer.allocUnsafeSlow(size)`. Official codemod: `npx codemod@latest @nodejs/slow-buffer-to-buffer-alloc-unsafe-slow`.",
    source: `${DEPS}#dep0030-slowbuffer`,
    fixable: false
  },
  {
    id: "dep0176-fs-access-constants",
    severity: "error",
    dep: "DEP0176",
    title: "`fs.F_OK`, `fs.R_OK`, `fs.W_OK`, `fs.X_OK` were removed in Node 25",
    why: "Node.js 25.0.0 removed the F_OK / R_OK / W_OK / X_OK getters exposed directly on node:fs, so they read as undefined.",
    fix: "Use `fs.constants.F_OK` (or `fs.promises.constants`). Official codemod: `npx codemod@latest @nodejs/fs-access-mode-constants`.",
    source: `${DEPS}#dep0176-fsf_ok-fsr_ok-fsw_ok-fsx_ok`,
    fixable: false
  },
  {
    id: "dep0147-rmdir-recursive",
    severity: "error",
    dep: "DEP0147",
    title: "`fs.rmdir(path, { recursive: true })` lost its recursive option in Node 25",
    why: "Node.js 25.0.0 moved DEP0147 to End-of-Life: fs.rmdir, fs.rmdirSync and fs.promises.rmdir no longer support `recursive`; on Node 26 the call throws ERR_INVALID_ARG_VALUE.",
    fix: "Use `fs.rm(path, { recursive: true, force: true })`. Official codemod: `npx codemod@latest @nodejs/rmdir`.",
    source: `${DEPS}#-recursive-true`,
    fixable: false
  },
  {
    id: "dep0173-calltracker",
    severity: "error",
    dep: "DEP0173",
    title: "`assert.CallTracker` was removed in Node 25",
    why: "Node.js 25.0.0 moved DEP0173 to End-of-Life: the assert.CallTracker API has been removed.",
    fix: "Use mock functions from `node:test` (`mock.fn()` and `fn.mock.callCount()`).",
    source: `${DEPS}#dep0173-the-assertcalltracker-class`,
    fixable: false
  },
  {
    id: "dep0094-assert-fail-args",
    severity: "error",
    dep: "DEP0094",
    title: "`assert.fail()` with more than one argument reached End-of-Life in Node 25",
    why: "Node.js 25.0.0 moved DEP0094 to End-of-Life: assert.fail(actual, expected, message, operator) is no longer supported; on Node 26 the extra arguments are dropped and the first one becomes the error message.",
    fix: "Pass one argument (`assert.fail('message')`) or use another node:assert method such as `assert.strictEqual(actual, expected, message)`.",
    source: `${DEPS}#dep0094-using-assertfail-with-more-than-one-argument`,
    fixable: false
  },
  {
    id: "dep0160-multiple-resolves",
    severity: "error",
    dep: "DEP0160",
    title: "`process.on('multipleResolves')` was removed in Node 25",
    why: "Node.js 25.0.0 moved DEP0160 to End-of-Life: the event was removed, so the handler never runs.",
    fix: "Remove the listener; track settled promises in your own code if you need it.",
    source: `${DEPS}#dep0160-processonmultipleresolves-handler`,
    fixable: false
  },
  {
    id: "dep0185-repl-without-new",
    severity: "error",
    dep: "DEP0185",
    title: "node:repl classes called without `new` reached End-of-Life in Node 25",
    why: "Node.js 25.0.0 moved DEP0185 to End-of-Life: REPLServer, Recoverable and the other node:repl classes must be instantiated with `new`.",
    fix: "Add `new` (`new repl.REPLServer(options)`) or use `repl.start()`. Official codemod: `npx codemod@latest @nodejs/repl-classes-with-new`.",
    source: `${DEPS}#dep0185-instantiating-noderepl-classes-without-new`,
    fixable: false
  },
  {
    id: "dep0077-module-debug",
    severity: "error",
    dep: "DEP0077",
    title: "`Module._debug()` was removed in Node 25",
    why: "Node.js 25.0.0 moved DEP0077 to End-of-Life: Module._debug() has been removed.",
    fix: "Remove the call; use `NODE_DEBUG=module` to trace module loading.",
    source: `${DEPS}#dep0077-module_debug`,
    fixable: false
  },
  {
    id: "dep0154-rsa-pss-hash",
    severity: "error",
    dep: "DEP0154",
    title: "RSA-PSS key generation options `hash` / `mgf1Hash` were removed in Node 25",
    why: "Node.js 25.0.0 moved DEP0154 to End-of-Life: generateKeyPair('rsa-pss') takes `hashAlgorithm` and `mgf1HashAlgorithm` only; `hash` throws ERR_INVALID_ARG_VALUE.",
    fix: "Rename `hash` to `hashAlgorithm` and `mgf1Hash` to `mgf1HashAlgorithm`. Official codemod: `npx codemod@latest @nodejs/crypto-rsa-pss-update`.",
    source: `${DEPS}#dep0154-rsa-pss-generate-key-pair-options`,
    fixable: false
  },
  {
    id: "dep0132-worker-terminate-callback",
    severity: "error",
    dep: "DEP0132",
    title: "`worker.terminate(callback)` reached End-of-Life in Node 25",
    why: "Node.js 25.0.0 moved DEP0132 to End-of-Life: passing a callback to worker.terminate() is no longer supported; on Node 26 the callback is silently never called.",
    fix: "Use the returned promise (`await worker.terminate()`) or listen for the worker's 'exit' event.",
    source: `${DEPS}#dep0132-workerterminate-with-callback`,
    fixable: false
  },
  {
    id: "dep0182-gcm-auth-tag",
    severity: "note",
    dep: "DEP0182",
    title: "GCM decryption without `authTagLength`: short tags are rejected since Node 26",
    why: "Node.js 26.0.0 moved DEP0182 to End-of-Life: decipher.setAuthTag() no longer accepts tags shorter than 16 bytes for AES-GCM unless authTagLength is set in createDecipheriv().",
    fix: "If your tags are shorter than 16 bytes, pass `{ authTagLength: <bytes> }` to `crypto.createDecipheriv()`.",
    source: `${DEPS}#dep0182-short-gcm-authentication-tags-without-explicit-authtaglength`,
    fixable: false
  },
  {
    id: "dep0205-module-register",
    severity: "note",
    dep: "DEP0205",
    title: "`module.register()` prints a runtime deprecation warning on Node 26",
    why: "Node.js 26.0.0 made DEP0205 a runtime deprecation; module.register() will be removed in a future version.",
    fix: "Move the hooks to `module.registerHooks()` (synchronous, in-thread).",
    source: `${DEPS}#dep0205-moduleregister`,
    fixable: false
  },
  {
    id: "dep0198-shake-output-length",
    severity: "note",
    dep: "DEP0198",
    title: "SHAKE-128/256 without `outputLength` prints a deprecation warning since Node 25",
    why: "Node.js 25.0.0 made DEP0198 a runtime deprecation: creating SHAKE digests without an explicit options.outputLength is deprecated.",
    fix: "Pass the length you rely on: `crypto.createHash('shake256', { outputLength: 32 })`.",
    source: `${DEPS}#dep0198-creating-shake-128-and-shake-256-digests-without-an-explicit-optionsoutputlength`,
    fixable: false
  },
  {
    id: "dep0031-ecdh-setpublickey",
    severity: "note",
    dep: "DEP0031",
    title: "`ecdh.setPublicKey()` prints a deprecation warning since Node 25",
    why: "Node.js 25.0.0 made DEP0031 a runtime deprecation: the method is not useful in the ECDH API.",
    fix: "Drop the call; ECDH only needs the private key (`ecdh.setPrivateKey()`), the public key is derived from it.",
    source: `${DEPS}#dep0031-ecdhsetpublickey`,
    fixable: false
  }
];
var BY_ID = new Map(RULES.map((r) => [r.id, r]));
function ruleMeta(id) {
  const r = BY_ID.get(id);
  if (!r) throw new Error(`unknown rule ${id}`);
  return r;
}

// src/scan.ts
import { existsSync, statSync as statSync2 } from "node:fs";

// src/commands.ts
var WRAPPERS = /* @__PURE__ */ new Set(["sudo", "exec", "time", "command", "env", "nohup", "then", "do", "else", "if", "while", "until", "!", "$", ">", "-", "{", "}"]);
function segments(text, start, end, quotesSplit) {
  const out = [];
  let segStart = start;
  let quote;
  const push = (i) => {
    if (i > segStart) out.push({ start: segStart, end: i });
  };
  for (let i = start; i < end; i++) {
    const c = text[i];
    if (c === "$" && text.startsWith("${{", i)) {
      const close = text.indexOf("}}", i + 3);
      if (close !== -1 && close < end) {
        i = close + 1;
        continue;
      }
    }
    if (quote) {
      if (c === quote) quote = void 0;
      else if (c === "\\" && quote === '"') i++;
      continue;
    }
    if (c === "\\") {
      i++;
      continue;
    }
    if ((c === "'" || c === '"') && !quotesSplit) {
      quote = c;
      continue;
    }
    if (c === "#" && (i === start || /\s/.test(text[i - 1]))) {
      push(i);
      while (i < end && text[i] !== "\n") i++;
      segStart = i + 1;
      continue;
    }
    const two = text.slice(i, i + 2);
    if (two === "&&" || two === "||" || two === "$(") {
      push(i);
      i++;
      segStart = i + 1;
      continue;
    }
    if (c === ";" || c === "|" || c === "&" || c === "\n" || c === "(" || c === ")" || c === "`" || quotesSplit && (c === "'" || c === '"')) {
      push(i);
      segStart = i + 1;
    }
  }
  push(end);
  return out;
}
var unquote = (w) => w.replace(/^(['"])(.*)\1$/, "$2").replace(/\\\n/g, "");
function words(text, start, end) {
  const out = [];
  const re = /(?:\$\{\{[\s\S]*?\}\}|[^\s'"\\]|\\[\s\S]|'[^']*'|"(?:[^"\\]|\\.)*")+/g;
  const slice = text.slice(start, end);
  for (let m = re.exec(slice); m; m = re.exec(slice)) {
    if (/^\\\s*$/.test(m[0])) continue;
    out.push({ word: m[0], at: start + m.index });
  }
  return out;
}
function findCommands(text, start, end, options = {}) {
  const commands = [];
  for (const seg of segments(text, start, end, options.quotesSplit ?? false)) {
    const ws = words(text, seg.start, seg.end).filter((w) => w.word !== "\\");
    let k = 0;
    while (k < ws.length && (WRAPPERS.has(ws[k].word) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(ws[k].word) || ws[k - 1]?.word === "sudo" && ws[k].word.startsWith("-"))) k++;
    const first = ws[k];
    if (!first) continue;
    const program = unquote(first.word).split("/").pop().replace(/^[@+-]+/, "");
    if (!/^[\w.-]+$/.test(program)) continue;
    const last = ws[ws.length - 1];
    const s = k === 0 ? first.at + (unquote(first.word).length - unquote(first.word).replace(/^[@+-]+/, "").length) : ws[0].at;
    commands.push({
      start: s,
      end: last.at + last.word.length,
      program,
      args: ws.slice(k + 1).map((w) => unquote(w.word)),
      words: ws.slice(k + 1).map((w) => ({ raw: w.word, at: w.at })),
      text: text.slice(s, last.at + last.word.length).replace(/\\\n\s*/g, " ")
    });
  }
  return commands;
}
var GLOBAL = /^(?:-g|--global|--location=global)$/;
function globalInstalls(c) {
  const a = c.args;
  const names = (list) => list.filter((x) => !x.startsWith("-")).map((x) => x.replace(/^(@?[^@]+)@.*$/, "$1"));
  if (c.program === "npm" && /^(?:i|install|add|in|isntall)$/.test(a[0] ?? "") && a.some((x) => GLOBAL.test(x))) return names(a.slice(1));
  if (c.program === "pnpm" && a[0] === "add" && a.some((x) => GLOBAL.test(x))) return names(a.slice(1));
  if (c.program === "yarn" && a[0] === "global" && a[1] === "add") return names(a.slice(2));
  if (c.program === "bun" && /^(?:add|install|i)$/.test(a[0] ?? "") && a.some((x) => GLOBAL.test(x))) return names(a.slice(1));
  if (c.program === "apk" && a[0] === "add" || (c.program === "apt-get" || c.program === "apt") && a[0] === "install") return names(a.slice(1));
  return [];
}
function provides(c) {
  const out = /* @__PURE__ */ new Set();
  for (const p of globalInstalls(c)) {
    if (p === "corepack" || p === "pnpm" || p === "yarn") out.add(p);
    if (p === "@pnpm/exe") out.add("pnpm");
  }
  if (c.program === "corepack" && (c.args[0] === "enable" || c.args[0] === "install")) {
    const which = c.args.slice(1).filter((x) => !x.startsWith("-"));
    if (which.length === 0 || which.includes("pnpm")) out.add("pnpm");
    if (which.length === 0 || which.includes("yarn")) out.add("yarn");
  }
  if ((c.program === "curl" || c.program === "wget") && c.text.includes("get.pnpm.io")) out.add("pnpm");
  if ((c.program === "curl" || c.program === "wget") && c.text.includes("yarnpkg.com/install.sh")) out.add("yarn");
  return out;
}
var SHELLS = /* @__PURE__ */ new Set(["sh", "bash", "zsh", "dash", "ash"]);
function shellScript(c) {
  if (!SHELLS.has(c.program)) return void 0;
  const i = c.words.findIndex((w) => /^-[a-z]*c[a-z]*$/.test(w.raw));
  const script = i === -1 ? void 0 : c.words[i + 1];
  if (!script || !/^(['"]).*\1$/s.test(script.raw)) return void 0;
  return { start: script.at + 1, end: script.at + script.raw.length - 1 };
}
var DOCKER_VALUE_OPTS = /* @__PURE__ */ new Set([
  "-e",
  "--env",
  "-v",
  "--volume",
  "-w",
  "--workdir",
  "-p",
  "--publish",
  "-u",
  "--user",
  "--name",
  "--network",
  "--entrypoint",
  "--platform",
  "--mount",
  "--env-file",
  "-l",
  "--label",
  "--add-host",
  "--cpus",
  "-m",
  "--memory",
  "-h",
  "--hostname",
  "--ipc",
  "--pull",
  "--shm-size",
  "--cap-add",
  "--device",
  "--gpus",
  "--tmpfs",
  "--ulimit",
  "--security-opt"
]);
function dockerRun(c) {
  if (c.program !== "docker" && c.program !== "podman") return void 0;
  let w = c.words;
  if (w[0]?.raw === "container") w = w.slice(1);
  const sub = w[0]?.raw;
  if (sub !== "run" && sub !== "create" && sub !== "exec") return void 0;
  let i = 1;
  while (i < w.length && w[i].raw.startsWith("-")) i += DOCKER_VALUE_OPTS.has(w[i].raw) ? 2 : 1;
  const first = w[i];
  if (!first) return void 0;
  return sub === "exec" ? { rest: w.slice(i + 1) } : { image: first, rest: w.slice(i + 1) };
}

// src/node-version.ts
var import_semver = __toESM(require_semver2(), 1);
var LTS_MAJOR = 26;
var CURRENT_MAJOR = 26;
var CODENAMES = {
  argon: 4,
  boron: 6,
  carbon: 8,
  dubnium: 10,
  erbium: 12,
  fermium: 14,
  gallium: 16,
  hydrogen: 18,
  iron: 20,
  jod: 22,
  krypton: 24,
  lithium: 26
};
var ABI = { 20: 115, 22: 127, 24: 137, 25: 141, 26: 147 };
var UNKNOWN = { major: void 0, label: "an unknown Node version" };
var floating = (kind, label) => ({ major: kind === "lts" ? LTS_MAJOR : CURRENT_MAJOR, floating: kind, label });
function fromSpec(raw, label = raw) {
  const spec = raw.trim().replace(/^['"]|['"]$/g, "").trim().toLowerCase();
  if (!spec || spec.includes("${") || spec.includes("$(")) return void 0;
  if (spec === "lts/*" || spec === "lts" || spec === "lts/-0" || spec === "--lts") return floating("lts", label);
  if (spec === "node" || spec === "latest" || spec === "current" || spec === "stable" || spec === "*" || spec === "x") return floating("current", label);
  const rel = /^lts\/-(\d+)$/.exec(spec);
  if (rel) return { major: LTS_MAJOR - 2 * Number(rel[1]), label };
  const code = /^lts\/([a-z]+)$/.exec(spec) ?? /^([a-z]+)$/.exec(spec);
  if (code && CODENAMES[code[1]] !== void 0) return { major: CODENAMES[code[1]], label };
  const exact = /^v?(\d+)(?:\.(?:\d+|x|\*))?(?:\.(?:\d+|x|\*))?(?:-[\w.]+)?$/.exec(spec);
  if (exact) return { major: Number(exact[1]), label };
  const range = import_semver.default.validRange(spec);
  if (!range) return void 0;
  if (import_semver.default.intersects(range, "99.x")) return floating("current", label);
  for (let m = CURRENT_MAJOR; m >= 4; m--) if (import_semver.default.intersects(range, `${m}.x`)) return { major: m, label };
  return void 0;
}
var NODE_REPO = /^(?:[\w.-]+(?::\d+)?\/)*node$/;
var VARIANT = /^(?:alpine[\d.]*|slim|bookworm|bullseye|buster|trixie|stretch|jessie|bookworm-slim|bullseye-slim|trixie-slim|buster-slim)$/;
function fromDockerImage(ref) {
  const at3 = ref.indexOf("@");
  const digest = at3 !== -1;
  const name = digest ? ref.slice(0, at3) : ref;
  const colon = name.lastIndexOf(":");
  const hasTag = colon > name.lastIndexOf("/");
  const repo = hasTag ? name.slice(0, colon) : name;
  const tag = hasTag ? name.slice(colon + 1) : void 0;
  if (!NODE_REPO.test(repo.toLowerCase())) return void 0;
  const t = (tag ?? "latest").toLowerCase();
  if (t.includes("$")) return { runtime: { major: void 0, label: ref }, repo, tag, digest };
  const label = ref;
  let runtime;
  const num = /^(\d+)(?:[.-]|$)/.exec(t);
  const lts = /^lts(?:-(.+))?$/.exec(t);
  const code = /^([a-z]+)(?:-|$)/.exec(t);
  if (num) runtime = { major: Number(num[1]), label };
  else if (lts) {
    const rest = lts[1]?.split("-")[0];
    runtime = rest && CODENAMES[rest] !== void 0 ? { major: CODENAMES[rest], label } : floating("lts", label);
  } else if (t === "latest" || t === "current" || t.startsWith("current-") || VARIANT.test(t)) runtime = floating("current", label);
  else if (code && CODENAMES[code[1]] !== void 0) runtime = { major: CODENAMES[code[1]], label };
  else runtime = { major: void 0, label };
  return { runtime, repo, tag, digest };
}
function fromKnownImage(ref) {
  if (/^mcr\.microsoft\.com\/playwright(?:\/[\w-]+)?(?::|@|$)/.test(ref)) {
    return { runtime: { major: void 0, label: `${ref} (Playwright images ship Node 26 since 2026-10-29)` }, yarn: true };
  }
  return void 0;
}
function pinnedTag(tag, major) {
  const t = tag ?? "latest";
  if (t === "latest" || t === "lts" || t === "current") return String(major);
  const prefixed = /^(?:lts|current)-(.+)$/.exec(t);
  if (prefixed) return `${major}-${prefixed[1]}`;
  if (VARIANT.test(t)) return `${major}-${t}`;
  return t;
}
function severityAt(runtime, removedIn) {
  if (runtime.major === void 0) return "warning";
  return runtime.major >= removedIn ? "error" : "note";
}
function describe(runtime) {
  if (runtime.major === void 0) return runtime.label;
  if (runtime.floating === "lts") return `${runtime.label} (Node ${runtime.major} LTS since 2026-10-28)`;
  if (runtime.floating) return `${runtime.label} (Node ${runtime.major} today)`;
  return `${runtime.label} (Node ${runtime.major})`;
}

// src/sources.ts
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join as join2, posix } from "node:path";
var SKIP_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".nuxt",
  ".output",
  "vendor",
  "coverage",
  ".turbo",
  ".vercel",
  ".netlify",
  ".venv",
  "target",
  ".yarn",
  ".pnpm-store",
  "bower_components"
]);
var MAX_BYTES = 1024 * 1024;
var MAX_LOCK_BYTES = 30 * 1024 * 1024;
var MAX_FILES = 3e4;
var AGENT_DOCS = /* @__PURE__ */ new Set(["AGENTS.md", "CLAUDE.md", "GEMINI.md", ".cursorrules", ".windsurfrules", "copilot-instructions.md"]);
var SOURCE_EXT = /\.(?:[cm]?js|jsx|[cm]?ts|tsx)$/;
function classify(path) {
  const name = posix.basename(path);
  const dir = posix.dirname(path);
  if (/(^|\/)\.github\/workflows$/.test(dir) && /\.ya?ml$/.test(name)) return "workflow";
  if (/(^|\/)\.github\/actions(\/|$)/.test(dir) && /^action\.ya?ml$/.test(name)) return "workflow";
  if (name === ".gitlab-ci.yml" || /\.gitlab-ci\.ya?ml$/.test(name)) return "gitlab";
  if (name === "Jenkinsfile" || /^Jenkinsfile\./.test(name) || name.endsWith(".jenkinsfile")) return "jenkinsfile";
  if (name === "netlify.toml") return "netlify";
  if (name === "vercel.json") return "vercel";
  if (name === "package.json") return "package";
  if (name === ".nvmrc" || name === ".node-version") return "node-version";
  if (name === "package-lock.json" || name === "npm-shrinkwrap.json" || name === "pnpm-lock.yaml") return "lockfile";
  if (/\.(sh|bash)$/.test(name)) return "shell";
  if (name === "Makefile" || name === "makefile" || name === "GNUmakefile" || name.endsWith(".mk")) return "makefile";
  if (name === "Dockerfile" || name === "Containerfile" || /^Dockerfile\./.test(name) || name.endsWith(".Dockerfile")) return "dockerfile";
  if (AGENT_DOCS.has(name)) return "agent-doc";
  if (SOURCE_EXT.test(name) && !name.endsWith(".d.ts") && !/\.min\.[cm]?js$/.test(name)) return "source";
  return void 0;
}
function loadRepo(root) {
  const files = [];
  let walked = 0;
  let truncated = false;
  const walk = (dir, rel) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (walked >= MAX_FILES) {
        truncated = true;
        return;
      }
      const relPath = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(join2(dir, e.name), relPath);
        continue;
      }
      if (!e.isFile()) continue;
      walked++;
      const kind = classify(relPath);
      if (!kind) continue;
      const full = join2(dir, e.name);
      if (statSync(full).size > (kind === "lockfile" ? MAX_LOCK_BYTES : MAX_BYTES)) continue;
      files.push({ path: relPath, text: readFileSync(full, "utf8"), kind });
    }
  };
  walk(root, "");
  return { root, files, truncated };
}
var YAML_SHELL_KEY = /^(\s*)(?:-\s+)?(run|script|before_script|after_script):[ \t]*(.*)$/;
function yamlShellSpans(text) {
  const spans = [];
  const lines = text.split("\n");
  const offsets = lineOffsets(lines);
  for (let i = 0; i < lines.length; i++) {
    const m = YAML_SHELL_KEY.exec(lines[i]);
    if (!m) continue;
    const indent = m[1].length;
    const value = m[3];
    const valueStart = offsets[i] + lines[i].length - value.length;
    if (value && !/^[|>][-+0-9]*\s*(#.*)?$/.test(value)) {
      const q = value[0];
      const v = value.trimEnd();
      if ((q === '"' || q === "'") && v.endsWith(q) && v.length > 1) spans.push({ start: valueStart + 1, end: valueStart + v.length - 1 });
      else spans.push({ start: valueStart, end: offsets[i] + lines[i].length });
    }
    let j = i + 1;
    for (; j < lines.length; j++) {
      const l = lines[j];
      if (l.trim() === "") continue;
      if (l.length - l.trimStart().length <= indent) break;
    }
    if (j > i + 1) {
      const items = lines.slice(i + 1, j).filter((l) => l.trim() !== "");
      if (items.length > 0 && /^\s*-\s/.test(items[0])) {
        for (let k = i + 1; k < j; k++) {
          const item = /^(\s*-\s+)(.*?)\s*$/.exec(lines[k]);
          if (!item || !item[2]) continue;
          const s = offsets[k] + item[1].length;
          const body = item[2];
          const quoted = body.length > 1 && (body[0] === '"' || body[0] === "'") && body.endsWith(body[0]);
          spans.push(quoted ? { start: s + 1, end: s + body.length - 1 } : { start: s, end: s + body.length });
        }
      } else {
        spans.push({ start: offsets[i + 1], end: offsets[j - 1] + lines[j - 1].length });
      }
      i = j - 1;
    }
  }
  return spans;
}
function jsonStringSpans(text, keys, within) {
  const spans = [];
  const from = within?.start ?? 0;
  const to = within?.end ?? text.length;
  for (const key of keys) {
    const re = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*:\\s*"`, "g");
    re.lastIndex = from;
    const m = re.exec(text);
    if (!m || m.index >= to) continue;
    const start = m.index + m[0].length;
    let end = start;
    while (end < text.length && text[end] !== '"') end += text[end] === "\\" ? 2 : 1;
    spans.push({ key, start, end });
  }
  return spans;
}
function packageScriptSpans(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return [];
  }
  const scripts = json.scripts && typeof json.scripts === "object" ? json.scripts : {};
  const at3 = text.search(/"scripts"\s*:\s*\{/);
  if (at3 === -1) return [];
  const names = Object.keys(scripts).filter((n) => typeof scripts[n] === "string");
  const close = matchingBrace(text, text.indexOf("{", at3));
  return jsonStringSpans(text, names, { start: at3, end: close }).map((s) => ({ name: s.key, start: s.start, end: s.end }));
}
function vercelCommandSpans(text) {
  return jsonStringSpans(text, ["installCommand", "buildCommand", "devCommand"]);
}
function netlifyCommandSpans(text) {
  const spans = [];
  const re = /^[ \t]*command[ \t]*=[ \t]*("""|'''|"|')/gm;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const q = m[1];
    const start = m.index + m[0].length;
    const end = text.indexOf(q, start);
    if (end !== -1) spans.push({ start, end });
  }
  return spans;
}
function markdownCodeSpans(text) {
  const spans = [];
  const fence = /^([ \t]*)(`{3,}|~{3,})[^\n]*\n([\s\S]*?)^\1\2[ \t]*$/gm;
  const fenced = [];
  for (let m = fence.exec(text); m; m = fence.exec(text)) {
    const start = m.index + m[0].indexOf("\n") + 1;
    spans.push({ start, end: start + m[3].length });
    fenced.push({ start: m.index, end: m.index + m[0].length });
  }
  const inline = /`([^`\n]+)`/g;
  for (let m = inline.exec(text); m; m = inline.exec(text)) {
    const at3 = m.index;
    if (fenced.some((f) => at3 >= f.start && at3 < f.end)) continue;
    spans.push({ start: at3 + 1, end: at3 + 1 + m[1].length });
  }
  return spans.sort((a, b) => a.start - b.start);
}
function matchingBrace(text, open) {
  let depth = 0;
  let inString = false;
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === "\\") i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i;
  }
  return text.length;
}
function lineOffsets(lines) {
  const offsets = [];
  let at3 = 0;
  for (const l of lines) {
    offsets.push(at3);
    at3 += l.length + 1;
  }
  return offsets;
}
function lineOf(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}
function lineText(text, line) {
  return text.split("\n")[line - 1] ?? "";
}
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return void 0;
  }
}

// src/contexts.ts
function newEnv(id, file, where, runtime, image = false) {
  return { id, file, where, image, runtime, preinstalled: /* @__PURE__ */ new Set(), installs: [], users: [], commands: [] };
}
function shellVars(text) {
  const vars = /* @__PURE__ */ new Map();
  for (const m of text.matchAll(/^[ \t]*(?:export\s+|readonly\s+|local\s+)?([A-Za-z_]\w*)=(['"]?)([^\s'"$]+)\2[ \t]*$/gm)) vars.set(m[1], m[3]);
  return vars;
}
function imageEnv(parent, ref, at3) {
  const node = fromDockerImage(ref);
  const known = node ? void 0 : fromKnownImage(ref);
  const runtime = node?.runtime ?? known?.runtime ?? { major: void 0, label: `image ${ref}` };
  const env = newEnv(`${parent.id}@${at3}`, parent.file, "docker", runtime, Boolean(node));
  if (known?.yarn) env.preinstalled.add("yarn");
  return env;
}
function addCommands(env, pieces, model) {
  const vars = shellVars(env.file.text);
  const add = (target, text, start, end, runtime, piece, depth) => {
    for (const c of findCommands(text, start, end, { quotesSplit: piece.quotesSplit })) {
      target.commands.push({ ...c, env: target, runtime, editable: piece.editable ?? true });
      if (depth > 2) continue;
      const script = shellScript(c);
      if (script) add(target, text, script.start, script.end, runtime, piece, depth + 1);
      const run2 = dockerRun(c);
      if (!run2?.image) continue;
      const ref = run2.image.raw.replace(/^(['"])(.*)\1$/, "$2").replace(/^\$\{?(\w+)\}?$/, (all2, name) => vars.get(name) ?? all2);
      const inner = imageEnv(target, ref, c.start);
      const head = run2.rest[0];
      if (head) {
        const restEnd = c.end;
        const nested = findCommands(text, head.at, restEnd, { quotesSplit: piece.quotesSplit })[0];
        if (nested) {
          inner.commands.push({ ...nested, env: inner, runtime: inner.runtime, editable: false });
          const s2 = shellScript(nested);
          if (s2) add(inner, text, s2.start, s2.end, inner.runtime, { ...piece, editable: false }, depth + 1);
        }
      }
      inner.commands.sort((a, b) => a.start - b.start);
      model?.envs.push(inner);
      if (model && fromDockerImage(ref)) {
        const image = fromDockerImage(ref);
        const off = run2.image.at + (run2.image.raw.length - run2.image.raw.replace(/^['"]/, "").length);
        if (run2.image.raw.replace(/^['"]|['"]$/g, "") === ref && !ref.includes("$")) model.versions.push({ file: env.file, start: off, end: off + ref.length, runtime: image.runtime, what: "docker-image", image, indirect: false });
      }
    }
  };
  for (const p of pieces) add(env, p.text ?? env.file.text, p.start, p.end, p.runtime, p, 0);
  env.commands.sort((a, b) => a.start - b.start);
}
function availableAt(env, at3, tool, options = {}) {
  if (env.preinstalled.has(tool) && !options.ignorePreinstalled) return true;
  if (env.installs.some((i) => i.at < at3 && i.tool === tool)) return true;
  if (env.commands.some((c) => c.start < at3 && provides(c).has(tool))) return true;
  return env.parent ? availableAt(env.parent, Number.POSITIVE_INFINITY, tool, options) : false;
}
var maskJsonEscapes = (text) => text.replace(/\\(["\\])/g, " $1");
var join3 = (dir, name) => dir ? `${dir}/${name}` : name;
function ancestors(path) {
  const parts = path.split("/").slice(0, -1);
  const out = [];
  for (let i = parts.length; i >= 0; i--) out.push(parts.slice(0, i).join("/"));
  return out;
}
function pinIn(files, dir = "") {
  for (const name of [".nvmrc", ".node-version"]) {
    const path = join3(dir, name);
    const f = files.find((x) => x.path === path);
    const v = f?.text.split("\n").map((l) => l.trim()).find((l) => l && !l.startsWith("#"));
    const r = v ? fromSpec(v, `${path} ${v}`) : void 0;
    if (r) return r;
  }
  const pkg = files.find((f) => f.path === join3(dir, "package.json"));
  const json = pkg ? parseJson(pkg.text) : void 0;
  if (typeof json?.volta?.node === "string") {
    const r = fromSpec(json.volta.node, `volta.node ${json.volta.node}`);
    if (r) return r;
  }
  const rt = runtimeEntry(json);
  if (rt) {
    const r = fromSpec(rt, `devEngines.runtime node ${rt}`);
    if (r) return r;
  }
  return void 0;
}
var UNPINNED = { ...UNKNOWN, label: "an unpinned Node (no .nvmrc, .node-version or volta pin)" };
function repoPin(files) {
  return pinIn(files) ?? UNPINNED;
}
function runtimeEntry(json) {
  const rt = json?.devEngines?.runtime;
  const list = Array.isArray(rt) ? rt : rt ? [rt] : [];
  const node = list.find((r) => typeof r === "object" && r !== null && r.name === "node");
  return typeof node?.version === "string" ? node.version : void 0;
}
function packageManagerOf(files, dir = "") {
  const pkg = files.find((f) => f.path === join3(dir, "package.json"));
  const json = pkg ? parseJson(pkg.text) : void 0;
  if (!pkg || !json) return void 0;
  const raw = typeof json.packageManager === "string" ? json.packageManager : void 0;
  const m = raw ? /^(pnpm|yarn|npm|bun)@([^+\s]+)/.exec(raw) : void 0;
  if (raw && m) return { name: m[1], version: m[2], raw, file: pkg };
  const dev = json.devEngines?.packageManager;
  const d = Array.isArray(dev) ? dev[0] : dev;
  if (d && typeof d.name === "string" && typeof d.version === "string") return { name: d.name, version: d.version, raw: `${d.name}@${d.version}`, file: pkg };
  return void 0;
}
function dockerInstructions(text) {
  const lines = text.split("\n");
  const offsets = lineOffsets(lines);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\s*)([A-Za-z]+)(\s+|$)/.exec(lines[i]);
    if (!m || lines[i].trimStart().startsWith("#")) continue;
    const start = offsets[i];
    let j = i;
    while (j < lines.length - 1 && /\\\s*$/.test(lines[j])) j++;
    let heredoc;
    const hd = /<<-?\s*["']?(\w+)["']?/.exec(lines[i]);
    if (hd && /^(RUN|COPY)$/i.test(m[2])) {
      let k = j + 1;
      while (k < lines.length && lines[k].trim() !== hd[1]) k++;
      heredoc = { start: offsets[j + 1] ?? text.length, end: offsets[k] ?? text.length };
      j = Math.min(k, lines.length - 1);
    }
    out.push({ keyword: m[2].toUpperCase(), bodyStart: start + m[0].length, end: offsets[j] + lines[j].length, heredoc });
    i = j;
  }
  return out;
}
function substitute(value, args) {
  return value.replace(/\$\{(\w+)(?::?-([^}]*))?\}|\$(\w+)/g, (all2, a, def, b) => {
    const v = args.get(a ?? b);
    return v !== void 0 && v !== "" ? v : def ?? all2;
  });
}
function dockerfile(file, model) {
  const text = file.text;
  const globalArgs = /* @__PURE__ */ new Map();
  const stages = /* @__PURE__ */ new Map();
  let env;
  let runtime = UNKNOWN;
  let seenFrom = false;
  let index = 0;
  for (const ins of dockerInstructions(text)) {
    const body = text.slice(ins.bodyStart, ins.end);
    if (ins.keyword === "ARG" && !seenFrom) {
      const m = /^\s*(\w+)=("?)([^"\s]*)\2/.exec(body);
      if (m) {
        const valueStart = ins.bodyStart + body.indexOf("=") + 1 + m[2].length;
        globalArgs.set(m[1], { value: m[3], start: valueStart, end: valueStart + m[3].length });
      }
      continue;
    }
    if (ins.keyword === "FROM") {
      seenFrom = true;
      const words2 = [...body.matchAll(/\S+/g)];
      const imageWord = words2.find((w) => !w[0].startsWith("--"));
      if (!imageWord) continue;
      const asIdx = words2.findIndex((w) => w[0].toLowerCase() === "as");
      const name = asIdx !== -1 ? words2[asIdx + 1]?.[0].toLowerCase() : void 0;
      const written = imageWord[0];
      const values = new Map([...globalArgs].map(([k, v]) => [k, v.value]));
      const resolved = substitute(written, values);
      const parent = stages.get(resolved.toLowerCase());
      const id = `${file.path}#stage${index++}${name ? `:${name}` : ""}`;
      env = newEnv(id, file, "docker", UNKNOWN);
      env.parent = parent;
      const image = fromDockerImage(resolved);
      if (parent) {
        runtime = parent.runtime;
        env.image = parent.image;
      } else if (image) {
        runtime = image.runtime;
        env.image = true;
        const at3 = ins.bodyStart + imageWord.index;
        const usesArg = written !== resolved;
        model.versions.push({ file, start: at3, end: at3 + written.length, runtime, what: "docker-image", image, indirect: usesArg });
        const arg = /\$\{?(\w+)/.exec(written);
        const def = arg ? globalArgs.get(arg[1]) : void 0;
        if (usesArg && def && image.runtime.floating) {
          model.versions.push({ file, start: def.start, end: def.end, runtime, what: "docker-arg", image, indirect: false });
        }
      } else {
        const known = fromKnownImage(resolved);
        runtime = known?.runtime ?? { major: void 0, label: `base image ${resolved}` };
        if (known?.yarn) env.preinstalled.add("yarn");
      }
      env.runtime = runtime;
      if (name) stages.set(name, env);
      model.envs.push(env);
      continue;
    }
    if (!env) continue;
    if (ins.keyword === "USER") {
      env.users.push({ at: ins.bodyStart, name: body.trim().split(":")[0] });
      continue;
    }
    if (ins.keyword !== "RUN") continue;
    if (ins.heredoc) {
      addCommands(env, [{ ...ins.heredoc, runtime }], model);
      continue;
    }
    const flags = /^(?:\s*--[\w-]+(?:=\S*)?)*\s*/.exec(body)[0].length;
    const start = ins.bodyStart + flags;
    if (text[start] === "[") {
      const argv = parseJson(text.slice(start, ins.end));
      if (Array.isArray(argv) && typeof argv[0] === "string") {
        env.commands.push({
          start,
          end: ins.end,
          program: argv[0].split("/").pop(),
          args: argv.slice(1).map(String),
          words: [],
          text: text.slice(start, ins.end),
          env,
          runtime,
          editable: false
        });
      }
      continue;
    }
    addCommands(env, [{ start, end: ins.end, runtime }], model);
  }
}
function yamlLines(text) {
  const lines = text.split("\n");
  const offsets = lineOffsets(lines);
  return lines.map((l, i) => ({ indent: l.length - l.trimStart().length, text: l, at: offsets[i], line: i + 1 }));
}
var isBlank = (l) => l.text.trim() === "" || l.text.trimStart().startsWith("#");
function scalar(l, key) {
  const m = new RegExp(`^(\\s*(?:-\\s+)?${key}:[ \\t]*)(.*?)\\s*$`).exec(l.text);
  if (!m) return void 0;
  let value = m[2].replace(/\s+#.*$/, "");
  let start = l.at + m[1].length;
  const q = value[0];
  if ((q === '"' || q === "'") && value.endsWith(q) && value.length > 1) {
    value = value.slice(1, -1);
    start++;
  }
  return { value, start, end: start + value.length };
}
function blockEnd(lines, i, baseIndent = lines[i].indent) {
  let j = i + 1;
  for (; j < lines.length; j++) {
    if (isBlank(lines[j])) continue;
    if (lines[j].indent <= baseIndent) break;
  }
  return j;
}
function listValues(lines, i) {
  const l = lines[i];
  const inline = /:\s*\[(.*)\]\s*$/.exec(l.text);
  if (inline) {
    const base = l.at + l.text.indexOf("[") + 1;
    const out2 = [];
    for (const m of inline[1].matchAll(/\s*(['"]?)([^,'"\]]+)\1\s*(?:,|$)/g)) {
      const v = m[2].trim();
      const s = base + m.index + m[0].indexOf(v);
      if (v) out2.push({ value: v, start: s, end: s + v.length });
    }
    return out2;
  }
  const one = scalar(l, "[\\w-]+");
  if (one && one.value && !/^[|>]/.test(one.value)) return [one];
  const out = [];
  for (let k = i + 1; k < blockEnd(lines, i); k++) {
    const m = /^(\s*-\s+)(['"]?)(.*?)\2\s*$/.exec(lines[k].text);
    if (m && m[3]) {
      const s = lines[k].at + m[1].length + m[2].length;
      out.push({ value: m[3], start: s, end: s + m[3].length });
    }
  }
  return out;
}
function worst(list) {
  if (list.length === 0) return UNKNOWN;
  return [...list].sort((a, b) => (b.major ?? 999) - (a.major ?? 999) || Number(Boolean(b.floating)) - Number(Boolean(a.floating)))[0];
}
var HOSTED_UBUNTU = /^(?:ubuntu-latest|ubuntu-24\.04)$/;
function versionFile(model, path) {
  const clean = path.replace(/^\.\//, "");
  const f = model.files.find((x) => x.path === clean);
  if (!f) return void 0;
  if (clean.endsWith("package.json")) {
    const json = parseJson(f.text);
    const spec = typeof json?.volta?.node === "string" ? json.volta.node : runtimeEntry(json) ?? (typeof json?.engines?.node === "string" ? json.engines.node : void 0);
    return spec ? fromSpec(spec, `${clean} \u2192 ${spec}`) : void 0;
  }
  if (clean.endsWith(".tool-versions")) {
    const m = /^nodejs\s+(\S+)/m.exec(f.text);
    return m ? fromSpec(m[1], `${clean} nodejs ${m[1]}`) : void 0;
  }
  const v = f.text.split("\n").map((l) => l.trim()).find(Boolean);
  return v ? fromSpec(v, `${clean} ${v}`) : void 0;
}
function workflow(file, model) {
  const lines = yamlLines(file.text);
  const jobsAt = lines.findIndex((l) => /^jobs:\s*$/.test(l.text));
  const ranges = [];
  if (jobsAt === -1) {
    ranges.push({ name: "action", from: 0, to: lines.length });
  } else {
    const first = lines.slice(jobsAt + 1).find((l) => !isBlank(l));
    const jobIndent = first?.indent ?? 2;
    for (let i = jobsAt + 1; i < lines.length; i++) {
      const l = lines[i];
      if (isBlank(l)) continue;
      if (l.indent < jobIndent) break;
      const m = /^\s*([\w-]+):\s*$/.exec(l.text);
      if (l.indent === jobIndent && m) ranges.push({ name: m[1], from: i, to: blockEnd(lines, i) });
    }
  }
  const spans = yamlShellSpans(file.text);
  for (const r of ranges) {
    const start = lines[r.from].at;
    const end = r.to < lines.length ? lines[r.to].at : file.text.length;
    const env = newEnv(`${file.path}#${r.name}`, file, "ci", UNKNOWN);
    const job = { file, name: r.name, env, start, end, setupNode: [], caches: [] };
    let runsOn = "";
    const matrix = /* @__PURE__ */ new Map();
    for (let i = r.from; i < r.to; i++) {
      const l = lines[i];
      if (isBlank(l)) continue;
      const ro = scalar(l, "runs-on");
      if (ro) runsOn = ro.value;
      if (/^\s*matrix:\s*$/.test(l.text)) {
        const mEnd = blockEnd(lines, i);
        const childIndent = lines.slice(i + 1, mEnd).find((x) => !isBlank(x))?.indent;
        for (let k = i + 1; k < mEnd; k++) {
          const key = /^\s*([\w-]+):/.exec(lines[k].text);
          if (key && lines[k].indent === childIndent) matrix.set(key[1], listValues(lines, k));
        }
      }
      const c = scalar(l, "container");
      if (c) {
        const ref = c.value || (() => {
          for (let k = i + 1; k < blockEnd(lines, i); k++) {
            const im = scalar(lines[k], "image");
            if (im) return im.value;
          }
          return "";
        })();
        const image = ref ? fromDockerImage(ref) : void 0;
        if (image) {
          job.container = image.runtime;
          env.image = true;
          const off = file.text.indexOf(ref, l.at);
          model.versions.push({ file, start: off, end: off + ref.length, runtime: image.runtime, what: "docker-image", image, indirect: ref.includes("${{") });
        } else if (ref) {
          const known = fromKnownImage(ref);
          job.container = known?.runtime ?? { major: void 0, label: `container ${ref}` };
          if (known?.yarn) env.preinstalled.add("yarn");
        }
      }
      const uses = scalar(l, "uses");
      if (uses) {
        const stepIndent = l.text.indexOf("uses:") - (/^\s*-\s+uses:/.test(l.text) ? 2 : 0);
        const withInputs = {};
        const withSpans = {};
        let k = i + 1;
        for (; k < r.to; k++) {
          const s = lines[k];
          if (isBlank(s)) continue;
          if (s.indent <= stepIndent && /^\s*-\s/.test(s.text)) break;
          if (s.indent < stepIndent) break;
          if (/^\s*with:\s*$/.test(s.text)) {
            for (let w = k + 1; w < blockEnd(lines, k); w++) {
              const kv = /^\s*([\w-]+):/.exec(lines[w].text);
              const v = kv ? scalar(lines[w], kv[1]) : void 0;
              if (kv && v) {
                let value = v.value;
                if (/^[|>]/.test(value)) value = lines.slice(w + 1, blockEnd(lines, w)).map((x) => x.text.trim()).join("\n");
                withInputs[kv[1]] = value;
                withSpans[kv[1]] = { start: v.start, end: v.end };
              }
            }
          }
        }
        const [action, ref = ""] = uses.value.split("@");
        if (action === "actions/setup-node") {
          let runtime;
          const spec = withInputs["node-version"];
          if (spec) {
            const mx = /\$\{\{\s*matrix\.([\w-]+)\s*\}\}/.exec(spec);
            if (mx) {
              const legs = matrix.get(mx[1]) ?? [];
              const resolved = legs.map((v) => ({ v, r: fromSpec(v.value, `setup-node matrix.${mx[1]} ${v.value}`) }));
              for (const { v, r: r2 } of resolved) if (r2) model.versions.push({ file, start: v.start, end: v.end, runtime: r2, what: "setup-node", indirect: false });
              const known = resolved.map((x) => x.r).filter((x) => Boolean(x));
              runtime = known.length ? worst(known) : { major: void 0, label: `setup-node ${spec}` };
            } else {
              runtime = fromSpec(spec, `setup-node ${spec}`) ?? { major: void 0, label: `setup-node ${spec}` };
              const sp = withSpans["node-version"];
              if (!spec.includes("${{")) model.versions.push({ file, start: sp.start, end: sp.end, runtime, what: "setup-node", indirect: false });
            }
          } else if (withInputs["node-version-file"]) {
            runtime = versionFile(model, withInputs["node-version-file"]) ?? { major: void 0, label: `setup-node node-version-file ${withInputs["node-version-file"]}` };
          }
          job.setupNode.push({ at: l.at, line: l.line, ref, inputs: withInputs, runtime });
        } else if (action === "pnpm/action-setup") {
          env.installs.push({ at: l.at, tool: "pnpm" });
        } else if (action === "pnpm/setup") {
          env.installs.push({ at: l.at, tool: "pnpm" });
          const rt = /^node@(.+)$/.exec(withInputs.runtime ?? "");
          if (rt) {
            const mx = /\$\{\{\s*matrix\.([\w-]+)\s*\}\}/.exec(rt[1]);
            const legs = mx ? (matrix.get(mx[1]) ?? []).map((v) => fromSpec(v.value, `pnpm/setup node@${v.value}`)).filter((x) => Boolean(x)) : [];
            const runtime = mx ? legs.length ? worst(legs) : void 0 : fromSpec(rt[1], `pnpm/setup node@${rt[1]}`);
            job.setupNode.push({ at: l.at, line: l.line, ref, inputs: {}, runtime });
          }
        } else if (action === "actions/cache" || action === "actions/cache/restore") {
          job.caches.push({ at: l.at, line: l.line, path: withInputs.path ?? "", key: withInputs.key ?? "" });
        }
        i = Math.max(i, k - 1);
      }
    }
    const hosted = HOSTED_UBUNTU.test(runsOn);
    if (!job.container && hosted) env.preinstalled.add("yarn");
    const before = job.container ?? (hosted ? { major: 22, label: `the runner's preinstalled Node (${runsOn} image)` } : { major: void 0, label: `the runner's preinstalled Node${runsOn ? ` (${runsOn})` : ""}` });
    const runtimeAt = (at3) => {
      if (job.container) return job.container;
      const last = job.setupNode.filter((s) => s.at < at3).pop();
      return last?.runtime ?? before;
    };
    env.runtime = before;
    addCommands(env, spans.filter((s) => s.start >= start && s.start < end).map((s) => ({ ...s, runtime: runtimeAt(s.start) })), model);
    model.envs.push(env);
    model.jobs.push(job);
  }
}
var GITLAB_RESERVED = /* @__PURE__ */ new Set(["image", "services", "stages", "variables", "include", "workflow", "default", "cache", "before_script", "after_script", "pages:deploy"]);
function gitlabImage(lines, from, to, indent) {
  for (let i = from; i < to; i++) {
    const l = lines[i];
    if (l.indent !== indent) continue;
    const im = scalar(l, "image");
    if (!im) continue;
    if (im.value) return { ref: im.value, start: im.start };
    for (let k = i + 1; k < blockEnd(lines, i); k++) {
      const n = scalar(lines[k], "name");
      if (n) return { ref: n.value, start: n.start };
    }
  }
  return void 0;
}
function gitlab(file, model) {
  const lines = yamlLines(file.text);
  const top = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (isBlank(l) || l.indent !== 0) continue;
    const m = /^([^\s:#][^:]*):/.exec(l.text);
    if (m) top.push({ name: m[1].trim(), from: i, to: blockEnd(lines, i, 0) });
  }
  const runtimeOf = (img, what) => {
    if (!img) return { runtime: { major: void 0, label: what }, node: false };
    const image = fromDockerImage(img.ref);
    if (!image) return { runtime: fromKnownImage(img.ref)?.runtime ?? { major: void 0, label: `image ${img.ref}` }, node: false };
    model.versions.push({ file, start: img.start, end: img.start + img.ref.length, runtime: image.runtime, what: "docker-image", image, indirect: img.ref.includes("$") });
    return { runtime: image.runtime, node: true };
  };
  const topImage = gitlabImage(lines, 0, lines.length, 0);
  const def = top.find((t) => t.name === "default");
  const defImage = topImage ?? (def ? gitlabImage(lines, def.from + 1, def.to, 2) : void 0);
  const base = runtimeOf(defImage, "the runner's default image");
  const spans = yamlShellSpans(file.text);
  const spanIn = (from, to) => {
    const s = lines[from].at;
    const e = to < lines.length ? lines[to].at : file.text.length;
    return spans.filter((x) => x.start >= s && x.start < e);
  };
  for (const t of top) {
    const isDefault = t.name === "default" || t.name === "before_script" || t.name === "after_script";
    if (GITLAB_RESERVED.has(t.name) && !isDefault) continue;
    const childIndent = lines.slice(t.from + 1, t.to).find((x) => !isBlank(x))?.indent ?? 2;
    const own = isDefault ? void 0 : gitlabImage(lines, t.from + 1, t.to, childIndent);
    const r = own ? runtimeOf(own, "") : base;
    const env = newEnv(`${file.path}#${t.name}`, file, "ci", r.runtime, r.node);
    addCommands(env, spanIn(t.from, t.to).map((s) => ({ ...s, runtime: r.runtime })), model);
    model.envs.push(env);
  }
}
function jenkinsfile(file, model) {
  const runtimes2 = [];
  const re = /\b(?:image|docker(?:\.image)?)\s*\(?\s*(['"])([^'"\s]+)\1/g;
  for (const m of file.text.matchAll(re)) {
    const image = fromDockerImage(m[2]);
    if (!image) continue;
    const start = m.index + m[0].lastIndexOf(m[2]);
    model.versions.push({ file, start, end: start + m[2].length, runtime: image.runtime, what: "docker-image", image, indirect: m[2].includes("$") });
    runtimes2.push(image.runtime);
  }
  const runtime = runtimes2.length ? worst(runtimes2) : { major: void 0, label: "the Jenkins agent's Node" };
  const env = newEnv(file.path, file, "ci", runtime, runtimes2.length > 0);
  const pieces = [];
  for (const l of yamlLines(file.text)) {
    if (l.text.trimStart().startsWith("//")) continue;
    pieces.push({ start: l.at, end: l.at + l.text.length, runtime, quotesSplit: true, editable: false });
  }
  addCommands(env, pieces, model);
  model.envs.push(env);
}
function netlify(file, model) {
  const m = /^[ \t]*NODE_VERSION[ \t]*=[ \t]*(["'])([^"'\n]+)\1/m.exec(file.text);
  let runtime = model.pinFor(file.path);
  if (m) {
    const start = m.index + m[0].lastIndexOf(m[2]);
    runtime = fromSpec(m[2], `netlify.toml NODE_VERSION ${m[2]}`) ?? { major: void 0, label: `NODE_VERSION ${m[2]}` };
    model.versions.push({ file, start, end: start + m[2].length, runtime, what: "netlify", indirect: false });
  }
  const env = newEnv(file.path, file, "ci", runtime);
  addCommands(env, netlifyCommandSpans(file.text).map((s) => ({ ...s, runtime })), model);
  model.envs.push(env);
}
function versionFileRef(file, model) {
  const m = /^\s*([^\s#]+)/.exec(file.text);
  if (!m) return;
  const start = m.index + m[0].length - m[1].length;
  const runtime = fromSpec(m[1], `${file.path} ${m[1]}`);
  if (runtime) model.versions.push({ file, start, end: start + m[1].length, runtime, what: "version-file", indirect: false });
}
function buildModel(files) {
  const pins = /* @__PURE__ */ new Map();
  const pms = /* @__PURE__ */ new Map();
  const nearest = (cache, read, path) => {
    for (const dir of ancestors(path)) {
      if (!cache.has(dir)) cache.set(dir, read(dir));
      const v = cache.get(dir);
      if (v !== void 0) return v;
    }
    return void 0;
  };
  const model = {
    files,
    envs: [],
    versions: [],
    jobs: [],
    repoPin: repoPin(files),
    pinFor: (path) => nearest(pins, (dir) => pinIn(files, dir), path) ?? UNPINNED,
    packageManager: packageManagerOf(files),
    packageManagerFor: (path) => nearest(pms, (dir) => packageManagerOf(files, dir), path)
  };
  for (const file of files) {
    switch (file.kind) {
      case "dockerfile":
        dockerfile(file, model);
        break;
      case "workflow":
        workflow(file, model);
        break;
      case "gitlab":
        gitlab(file, model);
        break;
      case "jenkinsfile":
        jenkinsfile(file, model);
        break;
      case "netlify":
        netlify(file, model);
        break;
      case "node-version":
        versionFileRef(file, model);
        break;
      case "vercel": {
        const env = newEnv(file.path, file, "ci", model.pinFor(file.path));
        addCommands(env, vercelCommandSpans(file.text).map((s) => ({ ...s, runtime: model.pinFor(file.path), text: maskJsonEscapes(file.text), editable: false })));
        model.envs.push(env);
        break;
      }
      case "package": {
        const env = newEnv(file.path, file, "script", model.pinFor(file.path));
        const text = maskJsonEscapes(file.text);
        addCommands(env, packageScriptSpans(file.text).map((s) => ({ start: s.start, end: s.end, runtime: model.pinFor(file.path), text })));
        model.envs.push(env);
        break;
      }
      case "shell":
      case "makefile": {
        const env = newEnv(file.path, file, "script", model.pinFor(file.path));
        addCommands(env, [{ start: 0, end: file.text.length, runtime: model.pinFor(file.path) }], model);
        model.envs.push(env);
        break;
      }
      case "agent-doc": {
        const env = newEnv(file.path, file, "doc", model.pinFor(file.path));
        addCommands(env, markdownCodeSpans(file.text).map((s) => ({ ...s, runtime: model.pinFor(file.path) })));
        model.envs.push(env);
        break;
      }
      default:
        break;
    }
  }
  return model;
}

// src/checks/runtime.ts
var capForDocs = (env, s) => env.where === "doc" && s === "error" ? "warning" : s;
function nonRootUser(env, at3) {
  const u = [...env.users].filter((x) => x.at < at3).pop();
  return u && u.name !== "root" && u.name !== "0" ? u.name : void 0;
}
function finding(rule, severity, c, message, insert) {
  const file = c.env.file;
  const line = lineOf(file.text, c.start);
  const edits = insert && severity !== "note" && c.editable && !nonRootUser(c.env, c.start) ? [{ start: c.start, end: c.start, text: insert }] : void 0;
  return { rule, severity: capForDocs(c.env, severity), message, file: file.path, line, snippet: lineText(file.text, line).trim(), edits };
}
var isBerry = (pm) => pm?.name === "yarn" && !/^1\./.test(pm.version);
function checkCorepack(model) {
  const out = [];
  for (const env of model.envs) {
    const c = env.commands.find((x) => x.program === "corepack" && !availableAt(env, x.start, "corepack"));
    if (!c) continue;
    const severity = severityAt(c.runtime, 25);
    const user = nonRootUser(env, c.start);
    let message = `\`${c.text}\` runs on ${describe(c.runtime)}: Node 25+ has no corepack binary, so this fails with "corepack: not found". Install it first with \`npm install -g corepack@${COREPACK_PIN}\`.`;
    if (severity === "note") message = `\`${c.text}\` works on ${describe(c.runtime)}, but breaks with "corepack: not found" on Node 25+ (node:lts is 26 now). Install corepack from npm before moving.`;
    if (c.runtime.major === 25) message += ` On Node 25, corepack ${COREPACK_PIN} prints an EBADENGINE warning (it declares ^22.22.2 || ^24.15.0 || >=26.0.0); prefer Node 26.`;
    if (user && severity !== "note") message += ` The stage runs as USER ${user} here, so put the install before the USER line (not rewritten).`;
    out.push(finding("corepack-not-bundled", severity, c, message, `npm install -g corepack@${COREPACK_PIN} && `));
  }
  return out;
}
function checkYarnInImage(model) {
  const out = [];
  for (const env of model.envs) {
    if (!env.image) continue;
    const c = env.commands.find((x) => x.program === "yarn" && !availableAt(env, x.start, "yarn"));
    if (!c || c.runtime.major === void 0) continue;
    const severity = severityAt(c.runtime, 26);
    const pm = model.packageManagerFor(env.file.path);
    const berry = isBerry(pm);
    const insert = berry ? `npm install -g corepack@${COREPACK_PIN} && corepack enable && ` : `npm install -g yarn@${YARN1_PIN} && `;
    const how = berry ? `this repo pins ${pm.raw}, so install corepack and run \`corepack enable\` first` : `install it first with \`npm install -g yarn@${YARN1_PIN}\``;
    const message = severity === "note" ? `\`${c.text}\` works on ${describe(c.runtime)}, but node images stop bundling Yarn 1 at Node 26 ("yarn: not found").` : `\`${c.text}\` runs in ${describe(c.runtime)}, and node images no longer bundle Yarn 1 as of Node 26 ("yarn: not found"); ${how}.`;
    out.push(finding("yarn-not-in-node26-image", severity, c, message, insert));
  }
  return out;
}
function checkPackageManagerInstalled(model) {
  const out = [];
  for (const env of model.envs) {
    if (env.where !== "docker" && env.where !== "ci" || env.file.kind === "netlify" || env.file.kind === "vercel") continue;
    const pm = model.packageManagerFor(env.file.path);
    if (!pm || pm.name !== "pnpm" && !isBerry(pm)) continue;
    const programs = pm.name === "pnpm" ? /* @__PURE__ */ new Set(["pnpm", "pnpx"]) : /* @__PURE__ */ new Set(["yarn"]);
    const tool = pm.name;
    const c = env.commands.find((x) => programs.has(x.program));
    if (!c || availableAt(env, c.start, tool, { ignorePreinstalled: tool === "yarn" })) continue;
    if (env.commands.some((x) => x.program === "corepack" && x.start < c.start)) continue;
    if (tool === "yarn" && env.image) continue;
    if (severityAt(c.runtime, 25) === "note") continue;
    const insert = tool === "pnpm" ? `npm install -g pnpm@${pm.version} && ` : void 0;
    const message = `\`${c.text}\` needs ${pm.raw} from package.json, but nothing installs ${tool} before it on ${describe(c.runtime)} (no corepack on Node 25+).${tool === "pnpm" ? ` Install it first: \`npm install -g pnpm@${pm.version}\`${env.where === "ci" && env.file.kind === "workflow" ? " or pnpm/action-setup" : ""}.` : " Install corepack from npm and run `corepack enable` first."}`;
    out.push(finding("package-manager-not-installed", "warning", c, message, insert));
  }
  return out;
}
var FLAG = /(^|[\s"'=])--experimental-transform-types\b/g;
function checkTransformTypesFlag(model) {
  const out = [];
  for (const file of model.files) {
    if (file.kind === "source" || file.kind === "lockfile") continue;
    for (const m of file.text.matchAll(FLAG)) {
      const at3 = m.index + m[1].length;
      const line = lineOf(file.text, at3);
      const text = lineText(file.text, line).trim();
      if (text.startsWith("#") || text.startsWith("//")) continue;
      const cmd = model.envs.filter((e) => e.file === file).flatMap((e) => e.commands).find((c) => c.start <= at3 && at3 <= c.end);
      const runtime = cmd?.runtime ?? model.envs.find((e) => e.file === file)?.runtime ?? model.pinFor(file.path);
      const severity = severityAt(runtime, 26);
      out.push({
        rule: "removed-transform-types-flag",
        severity: file.kind === "agent-doc" && severity === "error" ? "warning" : severity,
        message: `--experimental-transform-types was removed in Node 26, which exits with "bad option" (here: ${describe(runtime)}). Drop it; enums, namespaces and parameter properties then need tsc or tsx.`,
        file: file.path,
        line,
        snippet: text
      });
    }
  }
  return out;
}

// src/checks/source.ts
function maskJs(text) {
  const strings = [];
  const code = text.split("");
  const bare = text.split("");
  const blank = (arr, from, to) => {
    for (let k = from; k < to; k++) if (arr[k] !== "\n") arr[k] = " ";
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const n = text[i + 1];
    if (c === "/" && n === "/") {
      const e = text.indexOf("\n", i);
      const end = e === -1 ? text.length : e;
      blank(code, i, end);
      blank(bare, i, end);
      i = end;
    } else if (c === "/" && n === "*") {
      const e = text.indexOf("*/", i + 2);
      const end = e === -1 ? text.length : e + 2;
      blank(code, i, end);
      blank(bare, i, end);
      i = end;
    } else if (c === "/" && regexCanStart(text, i)) {
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== "\n") {
        const ch = text[j];
        if (ch === "\\") j++;
        else if (ch === "[") inClass = true;
        else if (ch === "]") inClass = false;
        else if (ch === "/" && !inClass) break;
        j++;
      }
      if (text[j] !== "/") {
        i++;
        continue;
      }
      blank(bare, i + 1, j);
      strings.push({ start: i, end: j });
      i = j + 1;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) {
        if (text[j] === "\\") j++;
        else if (c !== "`" && text[j] === "\n") break;
        j++;
      }
      blank(bare, i + 1, j);
      strings.push({ start: i, end: j });
      i = j + 1;
    } else i++;
  }
  return { code: code.join(""), bare: bare.join(""), strings };
}
function regexCanStart(text, at3) {
  let k = at3 - 1;
  while (k >= 0 && (text[k] === " " || text[k] === "	")) k--;
  if (k < 0 || text[k] === "\n") return true;
  const prev = text[k];
  if ("(,=:[!&|?{};+-*%<>~^".includes(prev)) return true;
  const word = /([A-Za-z_$][\w$]*)$/.exec(text.slice(Math.max(0, k - 10), k + 1));
  return Boolean(word && /^(?:return|typeof|case|do|else|in|of|new|delete|void|throw|yield|await)$/.test(word[1]));
}
var all = (re, text, group = 0) => [...text.matchAll(re)].map((m) => ({ at: m.index + (group ? m[0].indexOf(m[group]) : 0), start: m.index, detail: m[group] ?? m[0] }));
var inCode = (js, re, group = 0) => all(re, js.code, group).filter((h) => !js.inString(h.start));
var has = (js, re) => inCode(js, new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`)).length > 0;
var FS_MODULE = String.raw`['"](?:node:)?fs['"]`;
function fsBindings(js) {
  const names = /* @__PURE__ */ new Set();
  for (const h of inCode(js, new RegExp(String.raw`(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*${FS_MODULE}\s*\)`, "g"), 1)) names.add(h.detail);
  for (const h of inCode(js, new RegExp(String.raw`import\s+(?:\*\s+as\s+)?(\w+)\s*(?:,\s*\{[^}]*\})?\s*from\s*${FS_MODULE}`, "g"), 1)) names.add(h.detail);
  return [...names];
}
var importsModule = (js, mod) => has(js, new RegExp(String.raw`(?:require\(\s*|from\s*|import\s*\(\s*)['"](?:node:)?${mod}['"]`));
function argCount(code, open) {
  let depth = 0;
  let count = 0;
  let any = false;
  for (let i = open; i < code.length; i++) {
    const c = code[i];
    if (c === "(" || c === "[" || c === "{") {
      depth++;
      continue;
    }
    if (c === ")" || c === "]" || c === "}") {
      depth--;
      if (depth === 0) return any ? count + 1 : 0;
      continue;
    }
    if (depth === 1 && c === ",") count++;
    else if (depth === 1 && !/\s/.test(c)) any = true;
  }
  return any ? count + 1 : 0;
}
function callText(code, open) {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === "(") depth++;
    else if (code[i] === ")" && --depth === 0) return code.slice(open, i + 1);
  }
  return code.slice(open);
}
var STREAM_CLASS = { readable: "Readable", writable: "Writable", duplex: "Duplex", transform: "Transform", passthrough: "PassThrough" };
var SOURCE_RULES = [
  {
    id: "dep0193-stream-internals",
    removedIn: 26,
    find: (js) => inCode(js, /(?:require\s*\(\s*|from\s*|import\s*\(\s*|import\s+)['"]((?:node:)?_stream_(?:wrap|readable|writable|duplex|transform|passthrough))['"]/g, 1),
    message: (h) => {
      const kind = h.detail.replace(/^(?:node:)?_stream_/, "");
      const cls = STREAM_CLASS[kind];
      return cls ? `'${h.detail}' was removed in Node 26 (DEP0193), so require/import fails with MODULE_NOT_FOUND. Use \`require('node:stream').${cls}\` or \`import { ${cls} } from 'node:stream'\`.` : `'${h.detail}' was removed in Node 26 (DEP0125, DEP0193) and has no public replacement; wrap the socket with a node:stream Duplex instead.`;
    }
  },
  {
    id: "dep0063-writeheader",
    removedIn: 26,
    find: (js) => {
      const http = importsModule(js, "https?") || importsModule(js, "http2") || importsModule(js, "express");
      return all(/\b(\w+)\s*\.\s*writeHeader\s*\(/g, js.bare).filter((h) => http || /^(?:res|response|resp|reply|serverResponse)\s*\./.test(h.detail));
    },
    message: () => "ServerResponse.writeHeader() was removed in Node 26 (DEP0063) and throws `writeHeader is not a function`. Call `writeHead()` with the same arguments."
  },
  {
    id: "dep0030-slowbuffer",
    removedIn: 25,
    find: (js) => all(/(?<![.\w$])SlowBuffer\b/g, js.bare),
    message: () => "SlowBuffer was removed in Node 25 (DEP0030). Use `Buffer.allocUnsafeSlow(size)` (codemod: `npx codemod@latest @nodejs/slow-buffer-to-buffer-alloc-unsafe-slow`)."
  },
  {
    id: "dep0176-fs-access-constants",
    removedIn: 25,
    find: (js) => {
      const hits = [];
      for (const name of fsBindings(js)) hits.push(...all(new RegExp(String.raw`(?<![.\w$])${name}\.([FRWX]_OK)\b`, "g"), js.bare));
      hits.push(...inCode(js, new RegExp(String.raw`\{[^}]*\b[FRWX]_OK\b[^}]*\}\s*=\s*require\(\s*${FS_MODULE}\s*\)`, "g")));
      hits.push(...inCode(js, new RegExp(String.raw`import\s*\{[^}]*\b[FRWX]_OK\b[^}]*\}\s*from\s*${FS_MODULE}`, "g")));
      return hits;
    },
    message: (h) => `${/^[\w$]+\.[FRWX]_OK$/.test(h.detail ?? "") ? `\`${h.detail}\`` : "F_OK / R_OK / W_OK / X_OK on node:fs"} was removed in Node 25 (DEP0176) and is undefined now. Use \`fs.constants.*_OK\` (codemod: \`npx codemod@latest @nodejs/fs-access-mode-constants\`).`
  },
  {
    id: "dep0147-rmdir-recursive",
    removedIn: 25,
    find: (js) => inCode(js, /\brmdir(?:Sync)?\s*\(/g).filter((h) => /\brecursive\s*:\s*true/.test(callText(js.code, js.code.indexOf("(", h.at)))),
    message: () => "fs.rmdir(path, { recursive: true }) throws ERR_INVALID_ARG_VALUE since Node 25 (DEP0147). Use `fs.rm(path, { recursive: true, force: true })` (codemod: `npx codemod@latest @nodejs/rmdir`)."
  },
  {
    id: "dep0173-calltracker",
    removedIn: 25,
    find: (js) => all(/\bCallTracker\b/g, js.bare),
    message: () => "assert.CallTracker was removed in Node 25 (DEP0173) and is undefined now. Use `mock.fn()` from node:test and `fn.mock.callCount()`."
  },
  {
    id: "dep0094-assert-fail-args",
    removedIn: 25,
    find: (js) => all(/\bassert\s*\.\s*fail\s*\(/g, js.bare).filter((h) => argCount(js.bare, js.bare.indexOf("(", h.at)) > 1),
    message: () => "assert.fail() with more than one argument reached End-of-Life in Node 25 (DEP0094): the extra arguments are dropped and the first becomes the message. Pass a single message, or use `assert.strictEqual(actual, expected, message)`."
  },
  {
    id: "dep0160-multiple-resolves",
    removedIn: 25,
    find: (js) => inCode(js, /\bprocess\s*\.\s*(?:on|once|addListener|prependListener)\s*\(\s*['"]multipleResolves['"]/g),
    message: () => "The 'multipleResolves' event was removed in Node 25 (DEP0160): this handler never runs. Remove it."
  },
  {
    id: "dep0185-repl-without-new",
    removedIn: 25,
    find: (js) => all(/(?<!\bnew\s+)(?<![\w$])repl\s*\.\s*(?:REPLServer|Recoverable)\s*\(/g, js.bare),
    message: () => "node:repl classes must be called with `new` since Node 25 (DEP0185). Write `new repl.REPLServer(\u2026)` or use `repl.start()` (codemod: `npx codemod@latest @nodejs/repl-classes-with-new`)."
  },
  {
    id: "dep0077-module-debug",
    removedIn: 25,
    find: (js) => all(/\bModule\s*\.\s*_debug\b/g, js.bare),
    message: () => "Module._debug() was removed in Node 25 (DEP0077). Remove the call; NODE_DEBUG=module traces module loading."
  },
  {
    id: "dep0154-rsa-pss-hash",
    removedIn: 25,
    find: (js) => inCode(js, /\bgenerateKeyPair(?:Sync)?\s*\(\s*['"]rsa-pss['"]/g).filter((h) => /[{,]\s*(?:hash|mgf1Hash)\s*:/.test(callText(js.bare, js.bare.indexOf("(", h.at)))),
    message: () => "generateKeyPair('rsa-pss') throws ERR_INVALID_ARG_VALUE for `hash` / `mgf1Hash` since Node 25 (DEP0154). Rename them to `hashAlgorithm` / `mgf1HashAlgorithm` (codemod: `npx codemod@latest @nodejs/crypto-rsa-pss-update`)."
  },
  {
    id: "dep0132-worker-terminate-callback",
    removedIn: 25,
    find: (js) => importsModule(js, "worker_threads") ? all(/\.\s*terminate\s*\(/g, js.bare).filter((h) => argCount(js.bare, js.bare.indexOf("(", h.at)) > 0) : [],
    message: () => "worker.terminate(callback) reached End-of-Life in Node 25 (DEP0132): the callback is never called. Use `await worker.terminate()` or the worker's 'exit' event."
  },
  {
    id: "dep0182-gcm-auth-tag",
    removedIn: 26,
    note: true,
    find: (js) => {
      if (!/\bsetAuthTag\s*\(/.test(js.bare) || /\bauthTagLength\b/.test(js.bare)) return [];
      return inCode(js, /\bcreateDecipheriv\s*\(\s*['"`][^'"`]*gcm[^'"`]*['"`]/gi);
    },
    message: () => "AES-GCM decryption without authTagLength: since Node 26 (DEP0182) setAuthTag() rejects tags shorter than 16 bytes. If yours are shorter, pass `{ authTagLength }` to createDecipheriv()."
  },
  {
    id: "dep0205-module-register",
    removedIn: 26,
    note: true,
    find: (js) => {
      if (!importsModule(js, "module")) return [];
      const named = has(js, /import\s*\{[^}]*\bregister\b[^}]*\}\s*from\s*['"](?:node:)?module['"]/) || has(js, /\{[^}]*\bregister\b[^}]*\}\s*=\s*require\(\s*['"](?:node:)?module['"]\s*\)/);
      const hits = all(/(?<![\w$])module\s*\.\s*register\s*\(/g, js.bare);
      if (named) hits.push(...all(/(?<![.\w$])register\s*\(/g, js.bare));
      return hits;
    },
    message: () => "module.register() prints a runtime deprecation warning on Node 26 (DEP0205) and will be removed. Move the hooks to `module.registerHooks()`."
  },
  {
    id: "dep0198-shake-output-length",
    removedIn: 25,
    note: true,
    find: (js) => inCode(js, /\bcreateHash\s*\(\s*['"]shake(?:128|256)['"]\s*\)/gi),
    message: () => "SHAKE-128/256 without options.outputLength prints a deprecation warning since Node 25 (DEP0198). Pass `{ outputLength }`."
  },
  {
    id: "dep0031-ecdh-setpublickey",
    removedIn: 25,
    note: true,
    find: (js) => /\bcreateECDH\s*\(/.test(js.bare) ? all(/\.\s*setPublicKey\s*\(/g, js.bare) : [],
    message: () => "ecdh.setPublicKey() prints a deprecation warning since Node 25 (DEP0031). Drop it; the public key comes from the private key."
  }
];
function apiSeverity(runtimes2, removedIn) {
  if (runtimes2.length === 0) return "error";
  return runtimes2.some((r) => r.major === void 0 || r.floating || r.major >= removedIn) ? "error" : "warning";
}
function checkSourceApis(model) {
  const runtimes2 = model.versions.map((v) => v.runtime);
  const out = [];
  for (const file of model.files.filter((f) => f.kind === "source")) {
    const pin = model.pinFor(file.path);
    const known = pin.major !== void 0 ? [...runtimes2, pin] : runtimes2;
    if (!/_stream_|writeHeader|SlowBuffer|_OK\b|rmdir|CallTracker|assert|multipleResolves|repl|_debug|rsa-pss|terminate|setAuthTag|register|shake|setPublicKey/.test(file.text)) continue;
    const { code, bare, strings } = maskJs(file.text);
    const inString = (at3) => {
      let lo = 0;
      let hi = strings.length - 1;
      while (lo <= hi) {
        const mid = lo + hi >> 1;
        const s = strings[mid];
        if (at3 <= s.start) hi = mid - 1;
        else if (at3 >= s.end) lo = mid + 1;
        else return true;
      }
      return false;
    };
    const js = { code, bare, inString };
    for (const rule of SOURCE_RULES) {
      const seen = /* @__PURE__ */ new Set();
      for (const hit of rule.find(js)) {
        const line = lineOf(file.text, hit.at);
        if (seen.has(line)) continue;
        seen.add(line);
        out.push({
          rule: rule.id,
          severity: rule.note ? "note" : apiSeverity(known, rule.removedIn),
          message: rule.message(hit),
          file: file.path,
          line,
          snippet: lineText(file.text, line).trim()
        });
      }
    }
  }
  return out;
}

// src/checks/versions.ts
var import_semver2 = __toESM(require_semver2(), 1);
var NODE26 = "26.13.0";
function at(file, offset, rule, severity, message, edits) {
  const line = lineOf(file.text, offset);
  return { rule, severity, message, file: file.path, line, snippet: lineText(file.text, line).trim(), edits };
}
function pinEdit(v, pin) {
  if (v.indirect) return void 0;
  const written = v.file.text.slice(v.start, v.end);
  if (v.what === "docker-image" && v.image) return { start: v.start, end: v.end, text: `${v.image.repo}:${pinnedTag(v.image.tag, pin)}` };
  if (v.what === "docker-arg") return { start: v.start, end: v.end, text: pinnedTag(written, pin) };
  return { start: v.start, end: v.end, text: String(pin) };
}
var shadowedByArg = (model, v) => v.what === "docker-image" && v.indirect && model.versions.some((x) => x.what === "docker-arg" && x.file === v.file);
function checkFloating(model, options) {
  const out = [];
  for (const v of model.versions) {
    if (!v.runtime.floating || v.image?.digest || shadowedByArg(model, v)) continue;
    const written = v.file.text.slice(v.start, v.end);
    const pin = options.pin ?? LTS_MAJOR;
    const suggestion = v.what === "docker-image" && v.image ? `${v.image.repo}:${pinnedTag(v.image.tag, pin)}` : v.what === "docker-arg" ? pinnedTag(written, pin) : String(pin);
    const edit = options.pin !== void 0 ? pinEdit(v, options.pin) : void 0;
    out.push(at(
      v.file,
      v.start,
      "floating-node-version",
      "note",
      `\`${written}\` floats: ${describe(v.runtime)}. Pin a major (\`${suggestion}\`) so the next Node release does not change your build${options.pin === void 0 ? "; `--fix --pin 26` does it" : ""}.`,
      edit ? [edit] : void 0
    ));
  }
  return out;
}
function runtimes(model) {
  return [...model.versions.map((v) => v.runtime), ...model.envs.flatMap((e) => e.commands.map((c) => c.runtime)), model.repoPin];
}
var satisfies = (v, range) => import_semver2.default.satisfies(v, range, { includePrerelease: false });
function checkEngines(model) {
  const out = [];
  const all2 = runtimes(model);
  const reaches26 = all2.some((r) => r.floating || (r.major ?? 0) >= 26);
  const on25 = all2.some((r) => r.major === 25 && !r.floating);
  for (const file of model.files.filter((f) => f.kind === "package")) {
    const json = parseJson(file.text);
    const range = json?.engines?.node;
    if (typeof range !== "string" || !import_semver2.default.validRange(range)) continue;
    const offset = Math.max(0, file.text.search(/"engines"\s*:\s*\{[^}]*"node"/));
    const nodeAt = file.text.indexOf('"node"', offset);
    if (!satisfies(NODE26, range)) {
      const runsOn = all2.find((r) => r.floating || (r.major ?? 0) >= 26);
      out.push(at(
        file,
        nodeAt,
        "engines-exclude-node26",
        reaches26 ? "warning" : "note",
        `engines.node "${range}" does not allow Node ${NODE26}${runsOn ? `, but ${describe(runsOn)} runs this repo` : ""}: npm warns EBADENGINE, engine-strict installs fail. Add 26 when the tests pass on it.`
      ));
    } else if (on25 && !satisfies("25.9.0", range)) {
      out.push(at(
        file,
        nodeAt,
        "engines-exclude-node26",
        "warning",
        `engines.node "${range}" leaves out Node 25, which a Dockerfile or job here runs. Move that job to 26 or widen the range.`
      ));
    }
  }
  return out;
}
function checkMismatch(model) {
  const out = [];
  for (const v of model.versions) {
    if (v.what === "version-file" || shadowedByArg(model, v)) continue;
    const pin = model.pinFor(v.file.path);
    if (pin.major === void 0 || pin.floating) continue;
    const m = v.runtime.major;
    if (m === void 0 || m === pin.major || m < 25) continue;
    out.push(at(
      v.file,
      v.start,
      "node-version-mismatch",
      "warning",
      `The repo pins Node ${pin.major} (${pin.label}), but this runs ${describe(v.runtime)}. Pin it to ${pin.major}, or move the repo pin to ${m} after testing on it.`
    ));
  }
  return out;
}
function npmLockPackages(text) {
  const json = parseJson(text);
  if (!json?.packages) return [];
  return Object.entries(json.packages).filter(([path]) => path.includes("node_modules/")).map(([path, p]) => ({ ...p, name: path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length) }));
}
function pnpmLockEngines(text) {
  const out = [];
  let current;
  let offset = 0;
  for (const l of text.split("\n")) {
    const key = /^ {2}['"]?\/?(@?[^@\s'"]+)[@/]([^:'"(\s]+)[^:]*['"]?:\s*$/.exec(l);
    if (key) current = `${key[1]}@${key[2]}`;
    const eng = /^ {4}engines:\s*\{\s*node:\s*['"]?([^'"}]+?)['"]?\s*[,}]/.exec(l);
    if (eng && current) out.push({ name: current, range: eng[1].trim(), at: offset });
    offset += l.length + 1;
  }
  return out;
}
var listed = (names, max = 8) => `${names.slice(0, max).join(", ")}${names.length > max ? ` and ${names.length - max} more` : ""}`;
function checkDependencyEngines(model) {
  const out = [];
  for (const file of model.files.filter((f) => f.kind === "lockfile")) {
    const bad = [];
    if (file.path.endsWith("pnpm-lock.yaml")) {
      for (const p of pnpmLockEngines(file.text)) if (import_semver2.default.validRange(p.range) && !satisfies(NODE26, p.range)) bad.push(`${p.name} (${p.range})`);
    } else {
      for (const p of npmLockPackages(file.text)) {
        const range = typeof p.engines === "object" && p.engines !== null ? p.engines.node : void 0;
        if (typeof range === "string" && import_semver2.default.validRange(range) && !satisfies(NODE26, range)) bad.push(`${p.name}@${p.version ?? "?"} (${range})`);
      }
    }
    const unique = [...new Set(bad)];
    if (unique.length) {
      out.push(at(
        file,
        0,
        "dependency-engines-exclude-node26",
        "note",
        `${unique.length} locked package(s) declare engines.node without ${NODE26}: ${listed(unique)}. npm warns EBADENGINE for each; update them or check them on 26.`
      ));
    }
  }
  return out;
}
var ABI_TOOLS = ["nan", "bindings", "prebuild-install", "node-pre-gyp", "@mapbox/node-pre-gyp", "node-gyp-build", "node-gyp", "cmake-js"];
function checkNativeAddons(model) {
  const out = [];
  for (const file of model.files.filter((f) => f.kind === "lockfile" && !f.path.endsWith("pnpm-lock.yaml"))) {
    const native = npmLockPackages(file.text).filter((p) => p.hasInstallScript && (p.gypfile || ABI_TOOLS.some((t) => p.dependencies?.[t] !== void 0))).map((p) => `${p.name}@${p.version ?? "?"}`);
    const unique = [...new Set(native)];
    if (!unique.length) continue;
    out.push(at(
      file,
      0,
      "native-addon-rebuild",
      "note",
      `${unique.length} native addon(s) build or download a binary per Node ABI: ${listed(unique)}. Node 26 is NODE_MODULE_VERSION ${ABI[26]} (24 was ${ABI[24]}): reinstall on 26, and check each has a Node 26 prebuild or that python3, make and g++ are in the image.`
    ));
  }
  return out;
}

// src/checks/workflow.ts
var VERSION_IN_KEY = /matrix\.[\w-]*node[\w-]*|node[-_]?version|outputs\.[\w-]*version|nvmrc|node-?\d{2}\b|env\.NODE/i;
function at2(job, line, rule, severity, message) {
  return { rule, severity, message, file: job.file.path, line, snippet: lineText(job.file.text, line).trim() };
}
function checkSetupNodeCache(model) {
  const out = [];
  for (const job of model.jobs) {
    for (const step of job.setupNode) {
      const cache = step.inputs.cache?.trim();
      if (cache === "pnpm" && !availableAt(job.env, step.at, "pnpm")) {
        out.push(at2(
          job,
          step.line,
          "setup-node-cache-before-pm",
          "error",
          `setup-node has \`cache: pnpm\` but pnpm is not installed yet in job "${job.name}": the step fails with "Unable to locate executable file: pnpm". Put pnpm/action-setup before actions/setup-node.`
        ));
      } else if (cache === "yarn" && !availableAt(job.env, step.at, "yarn")) {
        out.push(at2(
          job,
          step.line,
          "setup-node-cache-before-pm",
          job.container?.major !== void 0 && job.container.major >= 26 ? "error" : "warning",
          `setup-node has \`cache: yarn\` in job "${job.name}", which runs in ${job.container?.label ?? "a runner without Yarn"}; node images ship no Yarn as of Node 26. Install Yarn (or corepack) before setup-node.`
        ));
      }
      const major = /^v?(\d+)/.exec(step.ref)?.[1];
      const pm = model.packageManager;
      if (major === "5" && cache === void 0 && step.inputs["package-manager-cache"]?.trim() !== "false" && pm && (pm.name === "pnpm" || pm.name === "yarn") && !availableAt(job.env, step.at, pm.name)) {
        out.push(at2(
          job,
          step.line,
          "setup-node-v5-auto-cache",
          "warning",
          `actions/setup-node@${step.ref} caches by itself for "packageManager": "${pm.raw}", and ${pm.name} is not installed before this step in job "${job.name}". Install it first, set \`package-manager-cache: false\`, or move to actions/setup-node@v6+.`
        ));
      }
    }
  }
  return out;
}
function checkNodeModulesCacheKey(model) {
  const out = [];
  for (const job of model.jobs) {
    for (const c of job.caches) {
      if (!/(^|[\s/*])node_modules\b/.test(c.path) || VERSION_IN_KEY.test(c.key)) continue;
      const setup = job.setupNode.filter((s) => s.at < c.at).pop() ?? job.setupNode[0];
      const runtime = job.container ?? setup?.runtime;
      const floating2 = Boolean(runtime?.floating) || runtime?.major === void 0;
      out.push(at2(
        job,
        c.line,
        "node-modules-cache-key",
        floating2 ? "warning" : "note",
        `This cache restores node_modules with key \`${c.key || "(none)"}\`, which has no Node version in it; ${floating2 ? `the job runs ${runtime?.label ?? "an unpinned Node"}, so after the move to 26 it restores addons built for another NODE_MODULE_VERSION (147 on Node 26).` : "after you move to Node 26 it restores addons built for the old NODE_MODULE_VERSION (147 on Node 26)."} Add the Node version to the key or cache the package manager store instead.`
      ));
    }
  }
  return out;
}

// src/types.ts
var SEVERITY_ORDER = { error: 3, warning: 2, note: 1 };

// src/scan.ts
function isDirectory(path) {
  return existsSync(path) && statSync2(path).isDirectory();
}
function scan(root, options = {}) {
  const exclude = options.exclude ?? [];
  const repo = loadRepo(root);
  const model = buildModel(repo.files);
  const findings = [
    ...checkCorepack(model),
    ...checkYarnInImage(model),
    ...checkPackageManagerInstalled(model),
    ...checkSetupNodeCache(model),
    ...checkTransformTypesFlag(model),
    ...checkFloating(model, { pin: options.pin }),
    ...checkEngines(model),
    ...checkMismatch(model),
    ...checkDependencyEngines(model),
    ...checkNativeAddons(model),
    ...checkNodeModulesCacheKey(model),
    ...checkSourceApis(model)
  ].filter((f) => !exclude.includes(f.rule));
  const order = new Map(RULES.map((r, i) => [r.id, i]));
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || (order.get(a.rule) ?? 0) - (order.get(b.rule) ?? 0));
  const scanned = {};
  for (const f of repo.files) scanned[f.kind] = (scanned[f.kind] ?? 0) + 1;
  return { root, findings, rules: RULES.filter((r) => !exclude.includes(r.id)), scanned, repoPin: describe(model.repoPin), truncated: repo.truncated };
}
function failsAt(findings, level) {
  return findings.some((f) => SEVERITY_ORDER[f.severity] >= SEVERITY_ORDER[level]);
}
function counts(findings) {
  const c = { error: 0, warning: 0, note: 0 };
  for (const f of findings) c[f.severity]++;
  return c;
}

// src/report/text.ts
var COLORS = { error: "\x1B[31m", warning: "\x1B[33m", note: "\x1B[36m" };
var RESET = "\x1B[0m";
var DIM = "\x1B[2m";
var NONE = "Nothing here breaks on Node 26 LTS as far as these rules can tell.";
function textReport(result, color = false) {
  const paint = (s, code) => color ? `${code}${s}${RESET}` : s;
  const lines = [];
  const kinds = Object.entries(result.scanned).map(([k, n]) => `${n} ${k}`).join(", ") || "no files these rules read";
  lines.push(`Scanned ${kinds}. Repo pin: ${result.repoPin}.`);
  if (result.truncated) lines.push("Stopped after 30000 files; run it on a smaller folder for a full scan.");
  if (result.findings.length === 0) {
    lines.push(NONE);
    return `${lines.join("\n")}
`;
  }
  lines.push("");
  for (const f of result.findings) {
    const fixable2 = f.edits ? paint(" [fixable]", DIM) : "";
    lines.push(`${f.file}:${f.line}  ${paint(f.severity.padEnd(7), COLORS[f.severity])} ${f.rule}${fixable2}`);
    lines.push(`  ${f.message.replace(/`/g, "")}`);
    if (f.snippet) lines.push(paint(`  > ${f.snippet.length > 160 ? `${f.snippet.slice(0, 157)}...` : f.snippet}`, DIM));
  }
  const c = counts(result.findings);
  const fixable = result.findings.filter((f) => f.edits).length;
  lines.push("");
  lines.push(`${c.error} error(s), ${c.warning} warning(s), ${c.note} note(s); ${fixable} can be rewritten with --fix.`);
  return `${lines.join("\n")}
`;
}

// src/report/markdown.ts
var ICON = { error: "Error", warning: "Warning", note: "Note" };
var MAX_ROWS = 200;
var cell = (s) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
function markdownReport(result, options = {}) {
  const c = counts(result.findings);
  const out = ["## Node 26 LTS upgrade check", ""];
  if (result.findings.length === 0) {
    out.push(NONE);
    return `${out.join("\n")}
`;
  }
  const fixable = result.findings.filter((f) => f.edits).length;
  out.push(`**${c.error}** errors, **${c.warning}** warnings, **${c.note}** notes. ${fixable} can be rewritten with \`--fix\`.`, "");
  out.push("| Level | Where | Rule | What to change |", "| --- | --- | --- | --- |");
  for (const f of result.findings.slice(0, MAX_ROWS)) {
    const path = options.pathPrefix ? `${options.pathPrefix}/${f.file}` : f.file;
    const where = options.blobUrl ? `[${cell(path)}:${f.line}](${options.blobUrl}/${path.split("/").map(encodeURIComponent).join("/")}#L${f.line})` : `\`${cell(path)}:${f.line}\``;
    const meta = ruleMeta(f.rule);
    out.push(`| ${ICON[f.severity]} | ${where} | [${meta.dep ?? f.rule}](${meta.source}) | ${cell(f.message)} |`);
  }
  if (result.findings.length > MAX_ROWS) out.push("", `${result.findings.length - MAX_ROWS} more findings are in the SARIF / JSON output.`);
  return `${out.join("\n")}
`;
}

// src/version.ts
var VERSION = "0.1.0";
var TOOL_NAME = "node26-lts-upgrade";
var REPO_URL = "https://github.com/atokim4/node26-lts-upgrade";

// src/report/sarif.ts
var SARIF_SCHEMA = "https://json.schemastore.org/sarif-2.1.0.json";
var pascal = (id) => id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
var plain = (s) => s.replace(/`/g, "");
var cap = (s, max = 1024) => s.length <= max ? s : `${s.slice(0, max - 1)}\u2026`;
function sarifRule(rule) {
  return {
    id: rule.id,
    name: pascal(rule.id),
    shortDescription: { text: cap(plain(rule.title)) },
    fullDescription: { text: cap(plain(rule.why)) },
    help: {
      text: `Why: ${plain(rule.why)}

Fix: ${plain(rule.fix)}

Source: ${rule.source}`,
      markdown: `**Why it breaks:** ${rule.why}

**What to write instead:** ${rule.fix}

[Source](${rule.source})`
    },
    helpUri: rule.source,
    defaultConfiguration: { level: rule.severity },
    properties: { tags: ["nodejs", "node26", ...rule.dep ? [rule.dep] : []], precision: rule.fixable ? "high" : "medium" }
  };
}
var encodePath = (path) => path.split("/").map(encodeURIComponent).join("/");
function toSarif(result, pathPrefix = "") {
  const prefix = pathPrefix.replace(/\\/g, "/").replace(/^\.\/?/, "").replace(/\/+$/, "");
  const rules = result.rules.map(sarifRule);
  const index = new Map(rules.map((r, i) => [r.id, i]));
  return {
    $schema: SARIF_SCHEMA,
    version: "2.1.0",
    runs: [
      {
        tool: { driver: { name: TOOL_NAME, semanticVersion: VERSION, informationUri: REPO_URL, rules } },
        results: result.findings.map((f) => ({
          ruleId: f.rule,
          ruleIndex: index.get(f.rule),
          level: f.severity,
          message: { text: plain(f.message) },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: encodePath(prefix ? `${prefix}/${f.file}` : f.file), uriBaseId: "%SRCROOT%" },
                region: { startLine: Math.max(1, f.line) }
              }
            }
          ]
        }))
      }
    ]
  };
}

// src/action/github.ts
import { randomUUID } from "node:crypto";
import { appendFileSync } from "node:fs";
import { EOL } from "node:os";
function getInput(name, env = process.env) {
  return (env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] ?? "").trim();
}
function setOutput(name, value, env = process.env) {
  const file = env.GITHUB_OUTPUT;
  if (!file) return;
  if (!/[\r\n]/.test(value)) {
    appendFileSync(file, `${name}=${value}${EOL}`);
    return;
  }
  const delimiter = `ghadelimiter_${randomUUID()}`;
  appendFileSync(file, `${name}<<${delimiter}${EOL}${value}${EOL}${delimiter}${EOL}`);
}
function appendSummary(markdown, env = process.env) {
  const file = env.GITHUB_STEP_SUMMARY;
  if (!file) return false;
  appendFileSync(file, markdown.endsWith("\n") ? markdown : `${markdown}
`);
  return true;
}
var escapeData = (s) => s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
var escapeProperty = (s) => escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
function annotation(level, message, props = {}) {
  const parts = Object.entries(props).filter(([, v]) => v !== void 0 && v !== "").map(([k, v]) => `${k}=${escapeProperty(String(v))}`);
  return `::${level}${parts.length ? ` ${parts.join(",")}` : ""}::${escapeData(message)}`;
}

// src/action/main.ts
var InputError = class extends Error {
};
function oneOf(name, value, allowed) {
  if (allowed.includes(value)) return value;
  throw new InputError(`input "${name}" must be one of ${allowed.join(", ")} (got "${value}")`);
}
var toPosix = (p) => p.split(sep).join("/");
function readInputs(env) {
  const workspace = resolve(env.GITHUB_WORKSPACE || process.cwd());
  const root = resolve(workspace, getInput("path", env) || ".");
  const prefix = toPosix(relative(workspace, root));
  if (prefix.startsWith("..") || isAbsolute(prefix)) throw new InputError(`input "path" must be inside the workspace (${workspace}), got ${root}`);
  if (!isDirectory(root)) throw new InputError(`input "path" is not a folder: ${root}`);
  const exclude = getInput("exclude", env).split(/[\s,]+/).filter(Boolean);
  const unknown = exclude.filter((id) => !RULES.some((r) => r.id === id));
  if (unknown.length) throw new InputError(`unknown rule id(s) in "exclude": ${unknown.join(", ")}`);
  return {
    workspace,
    root,
    prefix,
    failOn: oneOf("fail-on", getInput("fail-on", env) || "error", ["error", "warning", "note", "none"]),
    format: oneOf("format", getInput("format", env) || "sarif", ["sarif", "markdown"]),
    exclude,
    sarifFile: getInput("sarif-file", env) || "node26-lts.sarif",
    fix: oneOf("fix", getInput("fix", env) || "false", ["true", "false"]) === "true",
    pin: pinInput(getInput("pin", env))
  };
}
function pinInput(value) {
  if (!value) return void 0;
  if (!/^\d+$/.test(value) || Number(value) < 18) throw new InputError(`input "pin" takes a Node major such as 26 (got "${value}")`);
  return Number(value);
}
function blobUrl(env) {
  const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_SHA: sha } = env;
  return server && repo && sha ? `${server}/${repo}/blob/${sha}` : void 0;
}
function writeSarif(result, inputs) {
  const file = resolve(inputs.workspace, inputs.sarifFile);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync2(file, `${JSON.stringify(toSarif(result, inputs.prefix), null, 2)}
`);
  const rel = toPosix(relative(inputs.workspace, file));
  return rel.startsWith("..") || isAbsolute(rel) ? file : rel;
}
function applyFixes(result, inputs, log) {
  const fixable = result.findings.filter((f) => f.edits);
  const texts = new Map([...new Set(fixable.map((f) => f.file))].map((f) => [f, readFileSync2(join4(inputs.root, f), "utf8")]));
  const fixes = planFixes(texts, fixable);
  writeFixes(inputs.root, fixes);
  for (const f of fixes) log(unifiedDiff(inputs.prefix ? `${inputs.prefix}/${f.file}` : f.file, f.before, f.after));
  return fixes.reduce((n, f) => n + f.applied.length, 0);
}
var LEVEL = { error: "error", warning: "warning", note: "notice" };
function run(env = process.env, log = (l) => process.stdout.write(`${l}
`)) {
  let inputs;
  try {
    inputs = readInputs(env);
  } catch (error) {
    if (!(error instanceof InputError)) throw error;
    log(annotation("error", `${TOOL_NAME}: ${error.message}`));
    return 1;
  }
  const options = { exclude: inputs.exclude, pin: inputs.fix ? inputs.pin : void 0 };
  let result = scan(inputs.root, options);
  let fixed = 0;
  if (inputs.fix) {
    fixed = applyFixes(result, inputs, log);
    log(`Rewrote ${fixed} finding(s). Remaining:`);
    result = scan(inputs.root, options);
  }
  log(textReport(result).trimEnd());
  for (const f of result.findings) {
    const file = inputs.prefix ? `${inputs.prefix}/${f.file}` : f.file;
    log(annotation(LEVEL[f.severity], f.message.replace(/`/g, ""), { file, line: f.line, title: `Node 26 LTS: ${f.rule}` }));
  }
  const summary = markdownReport(result, { pathPrefix: inputs.prefix, blobUrl: blobUrl(env) });
  if (!appendSummary(summary, env) && inputs.format === "markdown") log(summary);
  const sarifFile = inputs.format === "sarif" ? writeSarif(result, inputs) : "";
  if (sarifFile) log(`SARIF written to ${sarifFile}`);
  const c = counts(result.findings);
  setOutput("findings-count", String(result.findings.length), env);
  setOutput("errors-count", String(c.error), env);
  setOutput("fixable-count", String(result.findings.filter((f) => f.edits).length), env);
  setOutput("fixed-count", String(fixed), env);
  setOutput("sarif-file", sarifFile, env);
  if (inputs.failOn !== "none" && failsAt(result.findings, inputs.failOn)) {
    log(annotation("error", `${TOOL_NAME}: failing because of findings at "${inputs.failOn}" level or above (set fail-on: none to only report)`));
    return 1;
  }
  return 0;
}

// src/action/index.ts
try {
  process.exitCode = run();
} catch (error) {
  process.stdout.write(`${annotation("error", `node26-lts-upgrade crashed: ${error.stack ?? String(error)}`)}
`);
  process.exitCode = 1;
}
