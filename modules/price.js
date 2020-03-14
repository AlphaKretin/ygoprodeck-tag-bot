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
var cards_1 = require("./cards");
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
var vendors = [
    {
        name: "TCGPlayer",
        api: "tcgplayer",
        aliases: ["tcg"],
        format: function (price) { return "$" + price; }
    },
    {
        name: "Cardmarket",
        api: "tcgplayer",
        aliases: ["market"],
        format: function (price) { return price + " €"; }
    },
    {
        name: "CoolStuffInc",
        api: "tcgplayer",
        aliases: ["cool", "coolstuff"],
        format: function (price) { return "$" + price; }
    }
];
function price(msg) {
    return __awaiter(this, void 0, void 0, function () {
        var terms, vendor, _i, vendors_1, vend, query, fuzzyResult, result, card, url, response, prices, priceProfiles, output, _a, priceProfiles_1, profile;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    terms = msg.content.toLowerCase().trim().split(/\s+/);
                    for (_i = 0, vendors_1 = vendors; _i < vendors_1.length; _i++) {
                        vend = vendors_1[_i];
                        if (vend.name.toLowerCase() == terms[1] || vend.aliases.includes(terms[1])) {
                            vendor = vend;
                        }
                    }
                    if (!(vendor === undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, msg.channel.createMessage("Please provide the name of a vendor to see their prices! The options are TCGPlayer, Cardmarket, and CoolStuffInc!")];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
                case 2:
                    query = terms.splice(2).join(" ");
                    if (!(query.length < 1)) return [3 /*break*/, 4];
                    return [4 /*yield*/, msg.channel.createMessage("Please provide the name of a card to see prices for!")];
                case 3:
                    _b.sent();
                    return [2 /*return*/];
                case 4:
                    fuzzyResult = cards_1.cardFuzzy.search(query);
                    if (!(fuzzyResult.length < 1)) return [3 /*break*/, 6];
                    return [4 /*yield*/, msg.channel.createMessage("Sorry, I couldn't find a card named `" + query + "`")];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
                case 6:
                    result = "name" in fuzzyResult[0] ? fuzzyResult[0] : fuzzyResult[0].item;
                    card = result.name;
                    url = config_json_1.priceSource + "?cardone=" + encodeURIComponent(card) + "&vendor=" + vendor.api;
                    return [4 /*yield*/, node_fetch_1.default(url)];
                case 7:
                    response = _b.sent();
                    return [4 /*yield*/, response.json()];
                case 8:
                    prices = _b.sent();
                    priceProfiles = messageCapSlice(prices.set_info.map(function (s) {
                        var rarity = s.rarity ? " (" + s.rarity + ")" : (s.rarity_short ? " " + s.rarity_short : "");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        var price = s.price !== null ? vendor.format(s.price) : "No market price";
                        return "[" + s.set + "](" + s.url + ")" + rarity + ": " + price;
                    }).join("\n"));
                    output = {
                        color: config_json_1.embed,
                        fields: [],
                        title: prices.card,
                        url: config_json_1.dbsource + encodeURIComponent(prices.card)
                    };
                    for (_a = 0, priceProfiles_1 = priceProfiles; _a < priceProfiles_1.length; _a++) {
                        profile = priceProfiles_1[_a];
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        output.fields.push({
                            name: vendor.name + " Prices",
                            value: profile
                        });
                    }
                    return [4 /*yield*/, msg.channel.createMessage({ embed: output })];
                case 9:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.price = price;
//# sourceMappingURL=price.js.map