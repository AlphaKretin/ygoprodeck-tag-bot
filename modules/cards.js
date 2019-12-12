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
var node_fetch_1 = __importDefault(require("node-fetch"));
var fuse_js_1 = __importDefault(require("fuse.js"));
var util_1 = require("./util");
var config_json_1 = require("../config.json");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var emotes = require("../emotes.json"); // required so as to not infer type
var fuseOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["name"]
};
var allCards = [];
var cardFuzzy = new fuse_js_1.default(allCards, fuseOptions);
function updateCardNames() {
    return __awaiter(this, void 0, void 0, function () {
        var rawResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, node_fetch_1.default(config_json_1.apisource)];
                case 1:
                    rawResponse = _a.sent();
                    return [4 /*yield*/, rawResponse.json()];
                case 2:
                    allCards = _a.sent();
                    cardFuzzy = new fuse_js_1.default(allCards, fuseOptions);
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateCardNames = updateCardNames;
function generateCardStats(card) {
    var stats = "";
    if (card.archetype) {
        stats += "**Archetype**: " + card.archetype;
    }
    stats += "\n";
    var type = "**Type**: " + card.type + " **Race**: " + card.race;
    stats += type;
    if (card.race in emotes) {
        stats += " " + emotes[card.race];
    }
    if (card.attribute) {
        stats += " **Attribute**: " + card.attribute;
        if (card.attribute in emotes) {
            stats += " " + emotes[card.attribute];
        }
    }
    stats += "\n";
    if (card.level) {
        var levelName = "Level";
        if (card.type.toLowerCase().includes("xyz")) {
            levelName = "Rank";
        }
        stats += "**" + levelName + "**: " + card.level;
    }
    if (card.linkval) {
        stats += "**Link Rating**: " + card.linkval;
    }
    if (card.atk) {
        stats += " **ATK**: " + card.atk;
    }
    if (card.def) {
        stats += " **DEF**: " + card.def;
    }
    if (card.linkmarkers) {
        stats += " **Link Markers**: " + card.linkmarkers.join(", ");
    }
    if (card.scale) {
        stats += " **Pendulum Scale**: " + card.scale;
    }
    stats += "\n";
    return stats;
}
function parseCardInfo(card) {
    var stats = generateCardStats(card);
    var outEmbed = {
        embed: {
            color: config_json_1.embed,
            description: stats,
            fields: [],
            footer: { text: card.id },
            thumbnail: { url: config_json_1.picsource + card.id + config_json_1.picext },
            title: card.name,
            url: config_json_1.dbsource + encodeURIComponent(card.name)
        }
    };
    if (outEmbed.embed && outEmbed.embed.fields) {
        var descs = util_1.messageCapSlice(card.desc);
        outEmbed.embed.fields.push({
            name: "Card Text",
            value: descs[0].length > 0 ? descs[0] : "[no card text]"
        });
        for (var i = 1; i < descs.length; i++) {
            outEmbed.embed.fields.push({
                name: "Continued",
                value: descs[i]
            });
        }
        if (card.banlist_info) {
            var banlistInfos = [];
            if (card.banlist_info.ban_ocg) {
                banlistInfos.push(card.banlist_info.ban_ocg + " (OCG)");
            }
            if (card.banlist_info.ban_tcg) {
                banlistInfos.push(card.banlist_info.ban_tcg + " (TCG)");
            }
            if (card.banlist_info.ban_goat) {
                banlistInfos.push(card.banlist_info.ban_goat + " (Goat)");
            }
            outEmbed.embed.fields.push({
                name: "Banlist Info",
                value: banlistInfos.join("\n"),
                inline: true
            });
        }
        var priceCM = "Cardmarket: €" + card.card_prices.cardmarket_price;
        var priceTP = "TCGPlayer: $" + card.card_prices.tcgplayer_price;
        var priceEB = "eBay: $" + card.card_prices.ebay_price;
        var priceAZ = "Amazon: $" + card.card_prices.amazon_price;
        outEmbed.embed.fields.push({
            name: "Prices",
            value: priceCM + " | " + priceTP + "\n" + priceEB + " | " + priceAZ,
            inline: true,
        });
    }
    return outEmbed;
}
function searchCard(query, msg) {
    return __awaiter(this, void 0, void 0, function () {
        var fuzzyResult, card;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fuzzyResult = cardFuzzy.search(query);
                    if (!(fuzzyResult.length > 0)) return [3 /*break*/, 2];
                    card = "name" in fuzzyResult[0] ? fuzzyResult[0] : fuzzyResult[0].item;
                    return [4 /*yield*/, msg.channel.createMessage(parseCardInfo(card))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, msg.addReaction("❌")];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.searchCard = searchCard;
//# sourceMappingURL=cards.js.map