/*
 * @package jsDAV
 * @subpackage DAV
 * @copyright Copyright(c) 2011 Ajax.org B.V. <info AT ajax DOT org>
 * @author Mike de Boer <info AT mikedeboer DOT nl>
 * @license http://github.com/mikedeboer/jsDAV/blob/master/LICENSE MIT License
 */
var Exc   = require("./exceptions");
var Util  = require("./util");
var Xml   = require("libxml/lib/libxml");
var JsDOM = require("jsdom").jsdom;

exports.XML_PARSER = "jsdom";//"libxml";

/**
 * Returns the 'clark notation' for an element.
 *
 * For example, and element encoded as:
 * <b:myelem xmlns:b="http://www.example.org/" />
 * will be returned as:
 * {http://www.example.org}myelem
 *
 * This format is used throughout the jsDAV sourcecode.
 * Elements encoded with the urn:DAV namespace will
 * be returned as if they were in the DAV: namespace. This is to avoid
 * compatibility problems.
 *
 * This function will return null if a nodetype other than an Element is passed.
 *
 * @param DOMElement dom
 * @return string
 */
exports.toClarkNotation = function(dom) {
    if (!dom)
        return null;
    if (!dom.nodeType)
        dom = {namespaceURI: dom, tagName: arguments[1], nodeType: 1};
    if (dom.nodeType !== 1)
        return null;

    // Mapping back to the real namespace, in case it was dav
    var ns = dom.namespaceURI == "urn:DAV" ? "DAV:" : dom.namespaceURI;
    // Mapping to clark notation
    return "{" + ns + "}" + dom.tagName;
};

/**
 * This method takes an XML document (as string) and converts all instances of the
 * DAV: namespace to urn:DAV
 *
 * This is unfortunately needed, because the DAV: namespace violates the xml namespaces
 * spec, and causes the DOM to throw errors
 */
exports.convertDAVNamespace = function(xmlDocument) {
    // This is used to map the DAV: namespace to urn:DAV. This is needed, because the DAV:
    // namespace is actually a violation of the XML namespaces specification, and will cause errors
    return xmlDocument.replace(/xmlns(:[A-Za-z0-9_]*)?=("|')DAV:("|')/g, "xmlns$1=$2urn:DAV$2");
};

exports.xmlEntityMap = {
    "quot": "34", "amp": "38", "apos": "39", "lt": "60", "gt": "62",
    "nbsp": "160", "iexcl": "161", "cent": "162", "pound": "163", "curren": "164",
    "yen": "165", "brvbar": "166", "sect": "167", "uml": "168", "copy": "169",
    "ordf": "170", "laquo": "171", "not": "172", "shy": "173", "reg": "174",
    "macr": "175", "deg": "176", "plusmn": "177", "sup2": "178", "sup3": "179",
    "acute": "180", "micro": "181", "para": "182", "middot": "183", "cedil": "184",
    "sup1": "185", "ordm": "186", "raquo": "187", "frac14": "188", "frac12": "189",
    "frac34": "190", "iquest": "191", "agrave": ["192", "224"], "aacute": ["193", "225"],
    "acirc": ["194", "226"], "atilde": ["195", "227"], "auml": ["196", "228"],
    "aring": ["197", "229"], "aelig": ["198", "230"], "ccedil": ["199", "231"],
    "egrave": ["200", "232"], "eacute": ["201", "233"], "ecirc": ["202", "234"],
    "euml": ["203", "235"], "igrave": ["204", "236"], "iacute": ["205", "237"],
    "icirc": ["206", "238"], "iuml": ["207", "239"], "eth": ["208", "240"],
    "ntilde": ["209", "241"], "ograve": ["210", "242"], "oacute": ["211", "243"],
    "ocirc": ["212", "244"], "otilde": ["213", "245"], "ouml": ["214", "246"],
    "times": "215", "oslash": ["216", "248"], "ugrave": ["217", "249"],
    "uacute": ["218", "250"], "ucirc": ["219", "251"], "uuml": ["220", "252"],
    "yacute": ["221", "253"], "thorn": ["222", "254"], "szlig": "223", "divide": "247",
    "yuml": ["255", "376"], "oelig": ["338", "339"], "scaron": ["352", "353"],
    "fnof": "402", "circ": "710", "tilde": "732", "alpha": ["913", "945"],
    "beta": ["914", "946"], "gamma": ["915", "947"], "delta": ["916", "948"],
    "epsilon": ["917", "949"], "zeta": ["918", "950"], "eta": ["919", "951"],
    "theta": ["920", "952"], "iota": ["921", "953"], "kappa": ["922", "954"],
    "lambda": ["923", "955"], "mu": ["924", "956"], "nu": ["925", "957"],
    "xi": ["926", "958"], "omicron": ["927", "959"], "pi": ["928", "960"],
    "rho": ["929", "961"], "sigma": ["931", "963"], "tau": ["932", "964"],
    "upsilon": ["933", "965"], "phi": ["934", "966"], "chi": ["935", "967"],
    "psi": ["936", "968"], "omega": ["937", "969"], "sigmaf": "962", "thetasym": "977",
    "upsih": "978", "piv": "982", "ensp": "8194", "emsp": "8195", "thinsp": "8201",
    "zwnj": "8204", "zwj": "8205", "lrm": "8206", "rlm": "8207", "ndash": "8211",
    "mdash": "8212", "lsquo": "8216", "rsquo": "8217", "sbquo": "8218", "ldquo": "8220",
    "rdquo": "8221", "bdquo": "8222", "dagger": ["8224", "8225"], "bull": "8226",
    "hellip": "8230", "permil": "8240", "prime": ["8242", "8243"], "lsaquo": "8249",
    "rsaquo": "8250", "oline": "8254", "frasl": "8260", "euro": "8364",
    "image": "8465", "weierp": "8472", "real": "8476", "trade": "8482",
    "alefsym": "8501", "larr": ["8592", "8656"], "uarr": ["8593", "8657"],
    "rarr": ["8594", "8658"], "darr": ["8595", "8659"], "harr": ["8596", "8660"],
    "crarr": "8629", "forall": "8704", "part": "8706", "exist": "8707", "empty": "8709",
    "nabla": "8711", "isin": "8712", "notin": "8713", "ni": "8715", "prod": "8719",
    "sum": "8721", "minus": "8722", "lowast": "8727", "radic": "8730", "prop": "8733",
    "infin": "8734", "ang": "8736", "and": "8743", "or": "8744", "cap": "8745",
    "cup": "8746", "int": "8747", "there4": "8756", "sim": "8764", "cong": "8773",
    "asymp": "8776", "ne": "8800", "equiv": "8801", "le": "8804", "ge": "8805",
    "sub": "8834", "sup": "8835", "nsub": "8836", "sube": "8838", "supe": "8839",
    "oplus": "8853", "otimes": "8855", "perp": "8869", "sdot": "8901", "lceil": "8968",
    "rceil": "8969", "lfloor": "8970", "rfloor": "8971", "lang": "9001", "rang": "9002",
    "loz": "9674", "spades": "9824", "clubs": "9827", "hearts": "9829", "diams": "9830"
};

/**
 * Escape an xml string making it ascii compatible.
 * @param {String} str the xml string to escape.
 * @return {String} the escaped string.
 */
exports.escapeXml = function(str) {
    return (str || "")
        .replace(/&/g, "&#38;")
        .replace(/"/g, "&#34;")
        .replace(/</g, "&#60;")
        .replace(/>/g, "&#62;")
        .replace(/'/g, "&#39;")
        .replace(/&([a-z]+);/gi, function(a, m) {
            var x = exports.xmlEntityMap[m.toLowerCase()];
            if (x)
                return "&#" + (Array.isArray(x) ? x[0] : x) + ";";
            return a;
        });
};

/**
 * This method provides a generic way to load a DOMDocument for WebDAV use.
 *
 * This method throws a jsDAV_Exception_BadRequest exception for any xml errors.
 * It does not preserve whitespace, and it converts the DAV: namespace to urn:DAV.
 *
 * @param string xml
 * @throws jsDAV_Exception_BadRequest
 * @return DOMDocument
 */
exports.loadDOMDocument = function(xml, callback) {
    if (!xml)
        return callback(new Exc.jsDAV_Exception_BadRequest("Empty XML document sent"));

    // The BitKinex client sends xml documents as UTF-16. PHP 5.3.1 (and presumably lower)
    // does not support this, so we must intercept this and convert to UTF-8.
    if (xml.substr(0, 12) === "\x3c\x00\x3f\x00\x78\x00\x6d\x00\x6c\x00\x20\x00") {
        // Note: the preceeding byte sequence is "<?xml" encoded as UTF_16, without the BOM.
        //$xml = iconv('UTF-16LE','UTF-8',$xml);
        // Because the xml header might specify the encoding, we must also change this.
        // This regex looks for the string encoding="UTF-16" and replaces it with
        // encoding="UTF-8".
        //xml = xml.replace(/<\?xml([^>]*)encoding="UTF-16"([^>]*)>/, "<?xml$1encoding=\"UTF-8\"$2>");
    }

    var root;
    xml = exports.convertDAVNamespace(xml);
    try {
        if (exports.XML_PARSER == "libxml") {
            root = exports.xmlParseError(Xml.parseFromString(xml).documentElement);
        }
        else if (exports.XML_PARSER == "jsdom") {
            var doc = JsDOM(xml);
            process.stdout.write(require("util").inspect(doc.childNodes[0].outerHTML));
            process.stdout.flush();
            process.exit();
        }
    }
    catch (ex) {
        return callback(new Exc.jsDAV_Exception_BadRequest(
            "The request body had an invalid XML body. (message: " + ex.message + ")"));
    }

    callback(null, root);
};

exports.xmlParseError = function(xml){
    //if (xml.documentElement.tagName == "parsererror") {
    if (xml.getElementsByTagName("parsererror").length) {
        Util.log("ATTENTION::: we actually HAVE an XML error :) ", "warn");
        var str     = xml.documentElement.firstChild.nodeValue.split("\n"),
            linenr  = str[2].match(/\w+ (\d+)/)[1],
            message = str[0].replace(/\w+ \w+ \w+: (.*)/, "$1"),

            srcText = xml.documentElement.lastChild.firstChild.nodeValue;//.split("\n")[0];
        throw new Error("XML Parse Error on line " +  linenr, message +
            "\nSource Text : " + srcText.replace(/\t/gi, " "));
    }

    return xml;
};

/**
 * Parses all WebDAV properties out of a DOM Element
 *
 * Generally WebDAV properties are encloded in {DAV:}prop elements. This
 * method helps by going through all these and pulling out the actual
 * propertynames, making them array keys and making the property values,
 * well.. the array values.
 *
 * If no value was given (self-closing element) null will be used as the
 * value. This is used in for example PROPFIND requests.
 *
 * Complex values are supported through the propertyMap argument. The
 * propertyMap should have the clark-notation properties as it's keys, and
 * classnames as values.
 *
 * When any of these properties are found, the unserialize() method will be
 * (statically) called. The result of this method is used as the value.
 *
 * @param {DOMElement} parentNode
 * @param {Object} propertyMap
 * @return array
 */
exports.parseProperties = function(parentNode, propertyMap) {
    propertyMap = propertyMap || [];
    var propNode, propNodeData, propertyName, j, k, c,
        propList   = {},
        childNodes = parentNode.childNodes,
        i          = 0,
        l          = childNodes.length;
    for (; i < l; ++i) {
        propNode = childNodes[i];

        if (exports.toClarkNotation(propNode) !== "{DAV:}prop")
            continue;

        for (j = 0, c = propNode.childNodes, k = c.length; j < k; ++j) {
            propNodeData = c[j];

            // If there are no elements in here, we actually get 1 text node,
            // this special case is dedicated to netdrive
            if (propNodeData.nodeType != 1) continue;

            propertyName = exports.toClarkNotation(propNodeData);
            if (propertyMap[propertyName]) { //@todo make serializers callable
                propList[propertyName] = propertyMap[propertyName].unserialize(propNodeData);
            }
            else {
                propList[propertyName] = propNodeData.nodeValue;
            }
        }
    }
    return propList;
};
