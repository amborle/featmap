import { ISubscription } from "../store/application/types";

export enum Roles {
    VIEWER = "VIEWER",
    EDITOR = "EDITOR",
    ADMIN = "ADMIN",
    OWNER = "OWNER",
}

export enum SubscriptionLevels {
    TRIAL = "TRIAL",
    BASIC = "BASIC",
    PRO = "PRO",
}

export const isEditor = (level: Roles) => {
    return level === Roles.EDITOR || level === Roles.ADMIN || level === Roles.OWNER
}

export const copyStringToClipboard = (input: string) => {
    const listener = (e: ClipboardEvent) => {
        e.clipboardData!.setData('text/plain', input);
        e.preventDefault();
    }

    document.addEventListener('copy', listener)
    document.execCommand('copy');
    document.removeEventListener('copy', listener);
}

export const daysBetween = (fromDate: Date, toDate: Date) => {
    const oneDay = 24 * 60 * 60 * 1000
    return Math.round(Math.abs((fromDate.getTime() - toDate.getTime()) / (oneDay)));
}


export enum CardStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED"
}

export type personaBarState = { page: "all" } | { page: "persona", personaId: string, edit: boolean } | { page: "create", workflowId: string, workflowTitle: string }


export const subscriptionLevelToText = (level: SubscriptionLevels) => {
    switch (level) {
        case SubscriptionLevels.TRIAL: {
            return "Trial"
        }
        case SubscriptionLevels.BASIC: {
            return "Team"
        }
        case SubscriptionLevels.PRO: {
            return "Business"
        }

        default: {
            return "Default"
        }
    }
}


export const memberLevelToTitle = (level: string) => {
    switch (level) {
        case "VIEWER":
            return "Viewer"
        case "EDITOR":
            return "Editor"
        case "ADMIN":
            return "Admin"
        case "OWNER":
            return "Owner"
        default:
            return ""
    }
}

export enum Color {
    NONE = "",
    WHITE = "WHITE",
    GREY = "GREY",
    RED = "RED",
    ORANGE = "ORANGE",
    YELLOW = "YELLOW",
    GREEN = "GREEN",
    TEAL = "TEAL",
    BLUE = "BLUE",
    INDIGO = "INDIGO",
    PURPLE = "PURPLE",
    PINK = "PINK"
}

export enum Annotation2 {
    RISKY = "Risky",
    UNCLEAR = "Unclear",
    SPLIT = "Can be split",
    DEPENDENCY = "Has dependencies",
    BLOCKED = "Blocked",
    DISCUSSION = "Discussion needed",
    REJECTED = "Rejected",
    IDEA = "Idea",
    RESEARCH = "Research needed",
}

export interface Annotation {
    name: string
    description: string
    icon: string
}

export class Annotations {

    annotations: Annotation[]

    constructor(annotations: Annotation[]) {
        this.annotations = annotations;
    }

    getDescriptionByName = (name: string) => {
        return this.annotations.find(an => an.name === name)?.description
    }

    toString = () => {
        return this.annotations.map(a => a.name).join(",")
    }

    add = (name: string) => {
        this.annotations.push(...annotationsFromNames([name]).annotations)
    }

    remove = (name: string[]) => {
        name.forEach(n => {
            this.annotations = this.annotations.filter(an => an.name !== n)
        })

        return this
    }

}

export const annotationsFromNames = (names: string[]): Annotations => {
    const ann = allAnnotations().annotations.flatMap(a => names.find(n => n === a.name) ? a : [])
    return new Annotations(ann)
}

export const dbAnnotationsFromNames = (ann: string) => {
    const list = ann.split(",")
    return annotationsFromNames(list)
}


export const allAnnotations = () => {
    return new Annotations(
        [
            { name: "RISKY", description: "Risky", icon: "local_fire_department" },
            { name: "UNCLEAR", description: "Unclear", icon: "help_outline" },
            { name: "SPLIT", description: "Can be split", icon: "call_split" },
            { name: "DEPENDENCY", description: "Has dependencies", icon: "timeline" },
            { name: "BLOCKED", description: "Blocked", icon: "block" },
            { name: "DISCUSSION", description: "Discussion needed", icon: "group" },
            { name: "REJECTED", description: "Rejected", icon: "thumb_down" },
            { name: "IDEA", description: "Idea", icon: "star_border" },
            { name: "RESEARCH", description: "Research needed", icon: "fact_check" }
        ]
    )
}

export const annotationsToEnums = (text: string): (Annotation2 | null)[] => {
    const list = text.split(",")
    const ann = list.map(t => {
        return Object.keys(Annotation2).map(an => {
            return an === t ? Annotation2[an as keyof typeof Annotation2] : []
        }).flat()
    }
    ).flat()

    return ann
}

// export const allAnnotations = () => {

//     let all: Annotation2[] = []

//     for (let ann in Annotation2) {
//         const a: Annotation2 = Annotation2[ann as keyof typeof Annotation2];
//         all.push(a)
//     }

//     return all
// }


export const Colors = new Array<Color>(
    Color.WHITE,
    Color.GREY,
    Color.RED,
    Color.ORANGE,
    Color.YELLOW,
    Color.GREEN,
    Color.TEAL,
    Color.BLUE,
    Color.INDIGO,
    Color.PURPLE,
    Color.PINK,
);




export const colorToBackgroundColorClass = (color: Color) => {
    switch (color) {
        case Color.WHITE:
            return "bg-white"
        case Color.GREY:
            return "bg-gray-500"
        case Color.RED:
            return "bg-red-400"
        case Color.ORANGE:
            return "bg-yellow-500"
        case Color.YELLOW:
            return "bg-yellow-300"
        case Color.GREEN:
            return "bg-green-400"
        case Color.TEAL:
            return "bg-green-600"
        case Color.BLUE:
            return "bg-blue-400"
        case Color.INDIGO:
            return "bg-indigo-400"
        case Color.PURPLE:
            return "bg-purple-400"
        case Color.PINK:
            return "bg-pink-400"
        case Color.NONE:
            return "bg-white"
        default:
            return "bg-white"
    }
}

export const colorToBorderColorClass = (color: Color) => {
    switch (color) {
        case Color.WHITE:
            return "border-gray-300"
        case Color.GREY:
            return "border-gray-500"
        case Color.RED:
            return "border-red-400"
        case Color.ORANGE:
            return "border-yellow-500"
        case Color.YELLOW:
            return "border-yellow-300"
        case Color.GREEN:
            return "border-green-400"
        case Color.TEAL:
            return "border-green-600"
        case Color.BLUE:
            return "border-blue-400"
        case Color.INDIGO:
            return "border-indigo-400"
        case Color.PURPLE:
            return "border-purple-400"
        case Color.PINK:
            return "border-pink-400"
        case Color.NONE:
            return "border-gray-500"
        default:
            return "border-gray-500"
    }
}

export const subIsInactive = (sub: ISubscription) => {
    switch (sub.externalStatus) {

        case "incomplete_expired":
        case "incomplete":
        case "past_due":
        case "canceled":
            return true
        case "trialing":
            return (new Date(sub.expirationDate)) < new Date()
        case "active":
            return false
        default:
            return true
    }
}

export const mustCreateNewSub = (sub: ISubscription) => {
    switch (sub.externalStatus) {
        case "incomplete_expired":
        case "incomplete":
        case "trialing":
        case "canceled":
            return true
        default:
            return false
    }
}

export const subIsTrial = (sub: ISubscription) => {
    return sub.externalStatus === "trialing"
}


export const subIsProOrAbove = (sub: ISubscription) => {
    return sub.level === SubscriptionLevels.PRO
}

export const subIsBasicOrAbove = (sub: ISubscription) => {
    return sub.level === SubscriptionLevels.PRO || sub.level === SubscriptionLevels.BASIC
}



export const countries = [
    {
        "Name": "Afghanistan",
        "Code": "AF"
    },
    {
        "Name": "Åland Islands",
        "Code": "AX"
    },
    {
        "Name": "Albania",
        "Code": "AL"
    },
    {
        "Name": "Algeria",
        "Code": "DZ"
    },
    {
        "Name": "American Samoa",
        "Code": "AS"
    },
    {
        "Name": "Andorra",
        "Code": "AD"
    },
    {
        "Name": "Angola",
        "Code": "AO"
    },
    {
        "Name": "Anguilla",
        "Code": "AI"
    },
    {
        "Name": "Antarctica",
        "Code": "AQ"
    },
    {
        "Name": "Antigua and Barbuda",
        "Code": "AG"
    },
    {
        "Name": "Argentina",
        "Code": "AR"
    },
    {
        "Name": "Armenia",
        "Code": "AM"
    },
    {
        "Name": "Aruba",
        "Code": "AW"
    },
    {
        "Name": "Australia",
        "Code": "AU"
    },
    {
        "Name": "Austria",
        "Code": "AT"
    },
    {
        "Name": "Azerbaijan",
        "Code": "AZ"
    },
    {
        "Name": "Bahamas",
        "Code": "BS"
    },
    {
        "Name": "Bahrain",
        "Code": "BH"
    },
    {
        "Name": "Bangladesh",
        "Code": "BD"
    },
    {
        "Name": "Barbados",
        "Code": "BB"
    },
    {
        "Name": "Belarus",
        "Code": "BY"
    },
    {
        "Name": "Belgium",
        "Code": "BE"
    },
    {
        "Name": "Belize",
        "Code": "BZ"
    },
    {
        "Name": "Benin",
        "Code": "BJ"
    },
    {
        "Name": "Bermuda",
        "Code": "BM"
    },
    {
        "Name": "Bhutan",
        "Code": "BT"
    },
    {
        "Name": "Bolivia, Plurinational State of",
        "Code": "BO"
    },
    {
        "Name": "Bonaire, Sint Eustatius and Saba",
        "Code": "BQ"
    },
    {
        "Name": "Bosnia and Herzegovina",
        "Code": "BA"
    },
    {
        "Name": "Botswana",
        "Code": "BW"
    },
    {
        "Name": "Bouvet Island",
        "Code": "BV"
    },
    {
        "Name": "Brazil",
        "Code": "BR"
    },
    {
        "Name": "British Indian Ocean Territory",
        "Code": "IO"
    },
    {
        "Name": "Brunei Darussalam",
        "Code": "BN"
    },
    {
        "Name": "Bulgaria",
        "Code": "BG"
    },
    {
        "Name": "Burkina Faso",
        "Code": "BF"
    },
    {
        "Name": "Burundi",
        "Code": "BI"
    },
    {
        "Name": "Cambodia",
        "Code": "KH"
    },
    {
        "Name": "Cameroon",
        "Code": "CM"
    },
    {
        "Name": "Canada",
        "Code": "CA"
    },
    {
        "Name": "Cape Verde",
        "Code": "CV"
    },
    {
        "Name": "Cayman Islands",
        "Code": "KY"
    },
    {
        "Name": "Central African Republic",
        "Code": "CF"
    },
    {
        "Name": "Chad",
        "Code": "TD"
    },
    {
        "Name": "Chile",
        "Code": "CL"
    },
    {
        "Name": "China",
        "Code": "CN"
    },
    {
        "Name": "Christmas Island",
        "Code": "CX"
    },
    {
        "Name": "Cocos (Keeling) Islands",
        "Code": "CC"
    },
    {
        "Name": "Colombia",
        "Code": "CO"
    },
    {
        "Name": "Comoros",
        "Code": "KM"
    },
    {
        "Name": "Congo",
        "Code": "CG"
    },
    {
        "Name": "Congo, the Democratic Republic of the",
        "Code": "CD"
    },
    {
        "Name": "Cook Islands",
        "Code": "CK"
    },
    {
        "Name": "Costa Rica",
        "Code": "CR"
    },
    {
        "Name": "Côte d'Ivoire",
        "Code": "CI"
    },
    {
        "Name": "Croatia",
        "Code": "HR"
    },
    {
        "Name": "Cuba",
        "Code": "CU"
    },
    {
        "Name": "Curaçao",
        "Code": "CW"
    },
    {
        "Name": "Cyprus",
        "Code": "CY"
    },
    {
        "Name": "Czech Republic",
        "Code": "CZ"
    },
    {
        "Name": "Denmark",
        "Code": "DK"
    },
    {
        "Name": "Djibouti",
        "Code": "DJ"
    },
    {
        "Name": "Dominica",
        "Code": "DM"
    },
    {
        "Name": "Dominican Republic",
        "Code": "DO"
    },
    {
        "Name": "Ecuador",
        "Code": "EC"
    },
    {
        "Name": "Egypt",
        "Code": "EG"
    },
    {
        "Name": "El Salvador",
        "Code": "SV"
    },
    {
        "Name": "Equatorial Guinea",
        "Code": "GQ"
    },
    {
        "Name": "Eritrea",
        "Code": "ER"
    },
    {
        "Name": "Estonia",
        "Code": "EE"
    },
    {
        "Name": "Ethiopia",
        "Code": "ET"
    },
    {
        "Name": "Falkland Islands (Malvinas)",
        "Code": "FK"
    },
    {
        "Name": "Faroe Islands",
        "Code": "FO"
    },
    {
        "Name": "Fiji",
        "Code": "FJ"
    },
    {
        "Name": "Finland",
        "Code": "FI"
    },
    {
        "Name": "France",
        "Code": "FR"
    },
    {
        "Name": "French Guiana",
        "Code": "GF"
    },
    {
        "Name": "French Polynesia",
        "Code": "PF"
    },
    {
        "Name": "French Southern Territories",
        "Code": "TF"
    },
    {
        "Name": "Gabon",
        "Code": "GA"
    },
    {
        "Name": "Gambia",
        "Code": "GM"
    },
    {
        "Name": "Georgia",
        "Code": "GE"
    },
    {
        "Name": "Germany",
        "Code": "DE"
    },
    {
        "Name": "Ghana",
        "Code": "GH"
    },
    {
        "Name": "Gibraltar",
        "Code": "GI"
    },
    {
        "Name": "Greece",
        "Code": "GR"
    },
    {
        "Name": "Greenland",
        "Code": "GL"
    },
    {
        "Name": "Grenada",
        "Code": "GD"
    },
    {
        "Name": "Guadeloupe",
        "Code": "GP"
    },
    {
        "Name": "Guam",
        "Code": "GU"
    },
    {
        "Name": "Guatemala",
        "Code": "GT"
    },
    {
        "Name": "Guernsey",
        "Code": "GG"
    },
    {
        "Name": "Guinea",
        "Code": "GN"
    },
    {
        "Name": "Guinea-Bissau",
        "Code": "GW"
    },
    {
        "Name": "Guyana",
        "Code": "GY"
    },
    {
        "Name": "Haiti",
        "Code": "HT"
    },
    {
        "Name": "Heard Island and McDonald Islands",
        "Code": "HM"
    },
    {
        "Name": "Holy See (Vatican City State)",
        "Code": "VA"
    },
    {
        "Name": "Honduras",
        "Code": "HN"
    },
    {
        "Name": "Hong Kong",
        "Code": "HK"
    },
    {
        "Name": "Hungary",
        "Code": "HU"
    },
    {
        "Name": "Iceland",
        "Code": "IS"
    },
    {
        "Name": "India",
        "Code": "IN"
    },
    {
        "Name": "Indonesia",
        "Code": "ID"
    },
    {
        "Name": "Iran, Islamic Republic of",
        "Code": "IR"
    },
    {
        "Name": "Iraq",
        "Code": "IQ"
    },
    {
        "Name": "Ireland",
        "Code": "IE"
    },
    {
        "Name": "Isle of Man",
        "Code": "IM"
    },
    {
        "Name": "Israel",
        "Code": "IL"
    },
    {
        "Name": "Italy",
        "Code": "IT"
    },
    {
        "Name": "Jamaica",
        "Code": "JM"
    },
    {
        "Name": "Japan",
        "Code": "JP"
    },
    {
        "Name": "Jersey",
        "Code": "JE"
    },
    {
        "Name": "Jordan",
        "Code": "JO"
    },
    {
        "Name": "Kazakhstan",
        "Code": "KZ"
    },
    {
        "Name": "Kenya",
        "Code": "KE"
    },
    {
        "Name": "Kiribati",
        "Code": "KI"
    },
    {
        "Name": "Korea, Democratic People's Republic of",
        "Code": "KP"
    },
    {
        "Name": "Korea, Republic of",
        "Code": "KR"
    },
    {
        "Name": "Kuwait",
        "Code": "KW"
    },
    {
        "Name": "Kyrgyzstan",
        "Code": "KG"
    },
    {
        "Name": "Lao People's Democratic Republic",
        "Code": "LA"
    },
    {
        "Name": "Latvia",
        "Code": "LV"
    },
    {
        "Name": "Lebanon",
        "Code": "LB"
    },
    {
        "Name": "Lesotho",
        "Code": "LS"
    },
    {
        "Name": "Liberia",
        "Code": "LR"
    },
    {
        "Name": "Libya",
        "Code": "LY"
    },
    {
        "Name": "Liechtenstein",
        "Code": "LI"
    },
    {
        "Name": "Lithuania",
        "Code": "LT"
    },
    {
        "Name": "Luxembourg",
        "Code": "LU"
    },
    {
        "Name": "Macao",
        "Code": "MO"
    },
    {
        "Name": "Macedonia, the Former Yugoslav Republic of",
        "Code": "MK"
    },
    {
        "Name": "Madagascar",
        "Code": "MG"
    },
    {
        "Name": "Malawi",
        "Code": "MW"
    },
    {
        "Name": "Malaysia",
        "Code": "MY"
    },
    {
        "Name": "Maldives",
        "Code": "MV"
    },
    {
        "Name": "Mali",
        "Code": "ML"
    },
    {
        "Name": "Malta",
        "Code": "MT"
    },
    {
        "Name": "Marshall Islands",
        "Code": "MH"
    },
    {
        "Name": "Martinique",
        "Code": "MQ"
    },
    {
        "Name": "Mauritania",
        "Code": "MR"
    },
    {
        "Name": "Mauritius",
        "Code": "MU"
    },
    {
        "Name": "Mayotte",
        "Code": "YT"
    },
    {
        "Name": "Mexico",
        "Code": "MX"
    },
    {
        "Name": "Micronesia, Federated States of",
        "Code": "FM"
    },
    {
        "Name": "Moldova, Republic of",
        "Code": "MD"
    },
    {
        "Name": "Monaco",
        "Code": "MC"
    },
    {
        "Name": "Mongolia",
        "Code": "MN"
    },
    {
        "Name": "Montenegro",
        "Code": "ME"
    },
    {
        "Name": "Montserrat",
        "Code": "MS"
    },
    {
        "Name": "Morocco",
        "Code": "MA"
    },
    {
        "Name": "Mozambique",
        "Code": "MZ"
    },
    {
        "Name": "Myanmar",
        "Code": "MM"
    },
    {
        "Name": "Namibia",
        "Code": "NA"
    },
    {
        "Name": "Nauru",
        "Code": "NR"
    },
    {
        "Name": "Nepal",
        "Code": "NP"
    },
    {
        "Name": "Netherlands",
        "Code": "NL"
    },
    {
        "Name": "New Caledonia",
        "Code": "NC"
    },
    {
        "Name": "New Zealand",
        "Code": "NZ"
    },
    {
        "Name": "Nicaragua",
        "Code": "NI"
    },
    {
        "Name": "Niger",
        "Code": "NE"
    },
    {
        "Name": "Nigeria",
        "Code": "NG"
    },
    {
        "Name": "Niue",
        "Code": "NU"
    },
    {
        "Name": "Norfolk Island",
        "Code": "NF"
    },
    {
        "Name": "Northern Mariana Islands",
        "Code": "MP"
    },
    {
        "Name": "Norway",
        "Code": "NO"
    },
    {
        "Name": "Oman",
        "Code": "OM"
    },
    {
        "Name": "Pakistan",
        "Code": "PK"
    },
    {
        "Name": "Palau",
        "Code": "PW"
    },
    {
        "Name": "Palestine, State of",
        "Code": "PS"
    },
    {
        "Name": "Panama",
        "Code": "PA"
    },
    {
        "Name": "Papua New Guinea",
        "Code": "PG"
    },
    {
        "Name": "Paraguay",
        "Code": "PY"
    },
    {
        "Name": "Peru",
        "Code": "PE"
    },
    {
        "Name": "Philippines",
        "Code": "PH"
    },
    {
        "Name": "Pitcairn",
        "Code": "PN"
    },
    {
        "Name": "Poland",
        "Code": "PL"
    },
    {
        "Name": "Portugal",
        "Code": "PT"
    },
    {
        "Name": "Puerto Rico",
        "Code": "PR"
    },
    {
        "Name": "Qatar",
        "Code": "QA"
    },
    {
        "Name": "Réunion",
        "Code": "RE"
    },
    {
        "Name": "Romania",
        "Code": "RO"
    },
    {
        "Name": "Russian Federation",
        "Code": "RU"
    },
    {
        "Name": "Rwanda",
        "Code": "RW"
    },
    {
        "Name": "Saint Barthélemy",
        "Code": "BL"
    },
    {
        "Name": "Saint Helena, Ascension and Tristan da Cunha",
        "Code": "SH"
    },
    {
        "Name": "Saint Kitts and Nevis",
        "Code": "KN"
    },
    {
        "Name": "Saint Lucia",
        "Code": "LC"
    },
    {
        "Name": "Saint Martin (French part)",
        "Code": "MF"
    },
    {
        "Name": "Saint Pierre and Miquelon",
        "Code": "PM"
    },
    {
        "Name": "Saint Vincent and the Grenadines",
        "Code": "VC"
    },
    {
        "Name": "Samoa",
        "Code": "WS"
    },
    {
        "Name": "San Marino",
        "Code": "SM"
    },
    {
        "Name": "Sao Tome and Principe",
        "Code": "ST"
    },
    {
        "Name": "Saudi Arabia",
        "Code": "SA"
    },
    {
        "Name": "Senegal",
        "Code": "SN"
    },
    {
        "Name": "Serbia",
        "Code": "RS"
    },
    {
        "Name": "Seychelles",
        "Code": "SC"
    },
    {
        "Name": "Sierra Leone",
        "Code": "SL"
    },
    {
        "Name": "Singapore",
        "Code": "SG"
    },
    {
        "Name": "Sint Maarten (Dutch part)",
        "Code": "SX"
    },
    {
        "Name": "Slovakia",
        "Code": "SK"
    },
    {
        "Name": "Slovenia",
        "Code": "SI"
    },
    {
        "Name": "Solomon Islands",
        "Code": "SB"
    },
    {
        "Name": "Somalia",
        "Code": "SO"
    },
    {
        "Name": "South Africa",
        "Code": "ZA"
    },
    {
        "Name": "South Georgia and the South Sandwich Islands",
        "Code": "GS"
    },
    {
        "Name": "South Sudan",
        "Code": "SS"
    },
    {
        "Name": "Spain",
        "Code": "ES"
    },
    {
        "Name": "Sri Lanka",
        "Code": "LK"
    },
    {
        "Name": "Sudan",
        "Code": "SD"
    },
    {
        "Name": "Suriname",
        "Code": "SR"
    },
    {
        "Name": "Svalbard and Jan Mayen",
        "Code": "SJ"
    },
    {
        "Name": "Swaziland",
        "Code": "SZ"
    },
    {
        "Name": "Sweden",
        "Code": "SE"
    },
    {
        "Name": "Switzerland",
        "Code": "CH"
    },
    {
        "Name": "Syrian Arab Republic",
        "Code": "SY"
    },
    {
        "Name": "Taiwan, Province of China",
        "Code": "TW"
    },
    {
        "Name": "Tajikistan",
        "Code": "TJ"
    },
    {
        "Name": "Tanzania, United Republic of",
        "Code": "TZ"
    },
    {
        "Name": "Thailand",
        "Code": "TH"
    },
    {
        "Name": "Timor-Leste",
        "Code": "TL"
    },
    {
        "Name": "Togo",
        "Code": "TG"
    },
    {
        "Name": "Tokelau",
        "Code": "TK"
    },
    {
        "Name": "Tonga",
        "Code": "TO"
    },
    {
        "Name": "Trinidad and Tobago",
        "Code": "TT"
    },
    {
        "Name": "Tunisia",
        "Code": "TN"
    },
    {
        "Name": "Turkey",
        "Code": "TR"
    },
    {
        "Name": "Turkmenistan",
        "Code": "TM"
    },
    {
        "Name": "Turks and Caicos Islands",
        "Code": "TC"
    },
    {
        "Name": "Tuvalu",
        "Code": "TV"
    },
    {
        "Name": "Uganda",
        "Code": "UG"
    },
    {
        "Name": "Ukraine",
        "Code": "UA"
    },
    {
        "Name": "United Arab Emirates",
        "Code": "AE"
    },
    {
        "Name": "United Kingdom",
        "Code": "GB"
    },
    {
        "Name": "United States",
        "Code": "US"
    },
    {
        "Name": "United States Minor Outlying Islands",
        "Code": "UM"
    },
    {
        "Name": "Uruguay",
        "Code": "UY"
    },
    {
        "Name": "Uzbekistan",
        "Code": "UZ"
    },
    {
        "Name": "Vanuatu",
        "Code": "VU"
    },
    {
        "Name": "Venezuela, Bolivarian Republic of",
        "Code": "VE"
    },
    {
        "Name": "Viet Nam",
        "Code": "VN"
    },
    {
        "Name": "Virgin Islands, British",
        "Code": "VG"
    },
    {
        "Name": "Virgin Islands, U.S.",
        "Code": "VI"
    },
    {
        "Name": "Wallis and Futuna",
        "Code": "WF"
    },
    {
        "Name": "Western Sahara",
        "Code": "EH"
    },
    {
        "Name": "Yemen",
        "Code": "YE"
    },
    {
        "Name": "Zambia",
        "Code": "ZM"
    },
    {
        "Name": "Zimbabwe",
        "Code": "ZW"
    }
]