"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Eris = __importStar(require("eris"));
var auth_json_1 = require("./auth.json");
var config_json_1 = require("./config.json");
var tags_1 = require("./modules/tags");
var util_1 = require("./modules/util");
var cards_js_1 = require("./modules/cards.js");
process.on("unhandledRejection", function (error) { return console.error(error); });
var bot = new Eris.Client(auth_json_1.token);
function update() {
    return __awaiter(this, void 0, void 0, function () {
        var proms;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    proms = [];
                    proms.push(tags_1.updateTagMap().then(function () { return console.log("Tags updated"); }));
                    proms.push(cards_js_1.updateCardNames().then(function () { return console.log("Card names updated"); }));
                    return [4 /*yield*/, Promise.all(proms)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
bot.on("messageCreate", function (msg) {
    if (msg.author.bot) {
        return;
    }
    if (msg.content.startsWith(config_json_1.prefix)) {
        var command = util_1.cleanString(msg.content);
        // Update command. Admin-only, updates the list of tags from the source.
        if (command.startsWith("update") && auth_json_1.admins.includes(msg.author.id)) {
            msg.channel.createMessage("Updating!").then(function (m) {
                update().then(function () {
                    m.edit("Update complete!");
                }, function (err) {
                    m.edit("Error!\n```\n" + err + "```");
                });
            });
            return;
        }
        if (command.startsWith("archives")) {
            var out = "This bot can display the following deck tags:\n`" + tags_1.fullTagNames.join("`, `") + "`";
            var outMessages_1 = util_1.messageCapSlice(out);
            if (outMessages_1.length > 1) {
                msg.channel.createMessage("This list of archives is very long! It takes multiple messages, so I'll send it to you in a DM").then(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var chan, _i, outMessages_2, mes;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, msg.author.getDMChannel()];
                            case 1:
                                chan = _a.sent();
                                _i = 0, outMessages_2 = outMessages_1;
                                _a.label = 2;
                            case 2:
                                if (!(_i < outMessages_2.length)) return [3 /*break*/, 5];
                                mes = outMessages_2[_i];
                                return [4 /*yield*/, chan.createMessage(mes)];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4:
                                _i++;
                                return [3 /*break*/, 2];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); });
            }
            else {
                msg.channel.createMessage(out).catch(function (e) { return console.error(e); });
            }
            return;
        }
        for (var tag in tags_1.tagMap) {
            if (command.startsWith(tag)) {
                msg.channel.createMessage(tags_1.tagMap[tag]).catch(function (e) { return console.error(e); });
                return;
            }
        }
    }
    var queryReg = /\[([^[]+?)\]/g; // declare anew in-scope to reset index
    var result = queryReg.exec(msg.content);
    if (result !== null) {
        cards_js_1.searchCard(result[1], msg).catch(function (e) { return console.error(e); });
    }
});
bot.on("error", function (err) { return console.error(err); });
bot.on("ready", function () {
    console.log("Logged in as %s - %s", bot.user.username, bot.user.id);
    update().then(function () { return console.log("Ready to go!"); });
});
bot.connect();
//# sourceMappingURL=tagbot.js.map