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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_json_1 = require("../config.json");
var node_fetch_1 = __importDefault(require("node-fetch"));
function messageCapSlice(outString, cap) {
    if (cap === void 0) { cap = 1024; }
    var outStrings = [];
    while (outString.length > cap) {
        var index = outString.slice(0, cap).lastIndexOf("\n");
        if (index === -1 || index >= cap) {
            index = outString.slice(0, cap).lastIndexOf(".");
            if (index === -1 || index >= cap) {
                index = outString.slice(0, cap).lastIndexOf(" ");
                if (index === -1 || index >= cap) {
                    index = cap - 1;
                }
            }
        }
        outStrings.push(outString.slice(0, index + 1));
        outString = outString.slice(index + 1);
    }
    outStrings.push(outString);
    return outStrings;
}
function price(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var card, vendor, url, response, prices, priceProfiles, output, _i, priceProfiles_1, profile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    card = "Odd-Eyes Pendulum Dragon";
                    vendor = "coolstuffinc";
                    url = config_json_1.priceSource + "?cardone=" + encodeURIComponent(card) + "&vendor=" + vendor;
                    return [4 /*yield*/, node_fetch_1.default(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    prices = _a.sent();
                    priceProfiles = messageCapSlice(prices.set_info.map(function (s) {
                        var rarity = s.rarity ? " (" + s.rarity + ")" : (s.rarity_short ? " " + s.rarity_short : "");
                        return "[" + s.set + "](" + s.url + ")" + rarity + ": $" + s.price.toFixed(2);
                    }).join("\n"));
                    output = {
                        color: config_json_1.embed,
                        fields: [],
                        title: prices.card,
                        url: config_json_1.dbsource + encodeURIComponent(prices.card)
                    };
                    for (_i = 0, priceProfiles_1 = priceProfiles; _i < priceProfiles_1.length; _i++) {
                        profile = priceProfiles_1[_i];
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        output.fields.push({
                            name: vendor + " Prices",
                            value: profile
                        });
                    }
                    return [4 /*yield*/, msg.channel.createMessage({ embed: output })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.price = price;
//# sourceMappingURL=price.js.map