;
(function() {
    var com = {};

    var _extend = function(newClass, sp, overrides) {
        if (typeof sp != 'function') return this;
        var sb = newClass,
            sbp = sb.prototype,
            spp = sp.prototype;
        if (sb.superclass == spp) return;
        sb.superclass = spp;
        sb.superclass.constructor = sp;
        for (var p in spp) {
            sbp[p] = spp[p];
        }
        if (overrides) {
            for (var p in overrides) {
                sbp[p] = overrides[p];
            }
        }
        return sb;
    };
    var _copy = function(to, from) {
        if (to && from) {
            for (var p in from) {
                to[p] = from[p];
            }
        }
        return to;
    }
    var _each = function(obj, iterator, context) {
        if (obj == null) return;
        if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === false)
                    return false;
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (iterator.call(context, obj[key], key, obj) === false)
                        return false;
                }
            }
        }
    };

    var _cssStyleToDomStyle = function() {
        var test = document.createElement('div').style,
            cache = {
                'float': test.cssFloat != undefined ? 'cssFloat' : test.styleFloat != undefined ? 'styleFloat' : 'float'
            };

        return function(cssName) {
            return cache[cssName] || (cache[cssName] = cssName.toLowerCase().replace(/-./g, function(match) {
                return match.charAt(1).toUpperCase();
            }));
        };
    }();


    var random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    var unit = {
         getdpi:function() {
            var arrDPI = [];
            if (window.screen.deviceXDPI) {
                arrDPI[0] = window.screen.deviceXDPI;
                arrDPI[1] = window.screen.deviceYDPI;
            }
            else {
                var tmpNode = document.createElement("DIV");
                tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
                document.body.appendChild(tmpNode);
                arrDPI[0] = parseInt(tmpNode.offsetWidth);
                arrDPI[1] = parseInt(tmpNode.offsetHeight);
                tmpNode.parentNode.removeChild(tmpNode);    
            }
            return arrDPI;
        },
        rounder: function(x, stellen) {
            return (Math.round(x * Math.pow(10, stellen))) / Math.pow(10, stellen)
        },
        px2cm: function (px, dpi){
            return unit.rounder((px / dpi) * 2.54, 2)
        },
        
    }
    var attrFix = {
        tabindex: "tabIndex",
        readonly: "readOnly",
        "for": "htmlFor",
        "class": "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder"
    };

    var utils = {
        unhtml: function(str, reg) {
            return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp|#\d+);)?/g, function(a, b) {
                if (b) {
                    return a;
                } else {
                    return {
                        '<': '&lt;',
                        '&': '&amp;',
                        '"': '&quot;',
                        '>': '&gt;',
                        "'": '&#39;'
                    }[a]
                }

            }) : '';
        },
        html: function(str) {
            return str ? str.replace(/&((g|l|quo)t|amp|#39|nbsp);/g, function(m) {
                return {
                    '&lt;': '<',
                    '&amp;': '&',
                    '&quot;': '"',
                    '&gt;': '>',
                    '&#39;': "'",
                    '&nbsp;': ' '
                }[m]
            }) : '';
        },
        createElement: function(doc, tag, attrs) {
            return this.setAttributes(doc.createElement(tag), attrs)
        },
        setAttributes: function(node, attrs) {
            for (var attr in attrs) {
                if (attrs.hasOwnProperty(attr)) {
                    var value = attrs[attr];
                    switch (attr) {
                        case 'class':
                            //ie下要这样赋值，setAttribute不起作用
                            node.className = value;
                            break;
                        case 'style':
                            node.style.cssText = node.style.cssText + ";" + value;
                            break;
                        case 'innerHTML':
                            node[attr] = value;
                            break;
                        case 'value':
                            node.value = value;
                            break;
                        default:
                            node.setAttribute(attrFix[attr] || attr, value);
                    }
                }
            }
            return node;
        },
    }
    _copy(com, utils);
    _copy(com, unit);
    com.extend = _extend;
    com.copy = _copy;
    com.each = _each;
    com.random = random;
    com.cssCamelize = _cssStyleToDomStyle;
    _each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object', 'Date'], function(v) {
        com['is' + v] = function(obj) {
            return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
        }
    });



    window.com = com;

})();
