;
(function() {
    var uid = 0;
    var Draw = function(id, options) {
        options || (options = {});
        this.id = id;
        this.uid = ++uid;
        this.cid = this.uid;
        this.$el = $('#' + id);
        this.options = $.extend({}, Default, options);
        Draw.setInstance(id, this);
    }
    Draw.instances = {};
    Draw._prefix = "draw_v0_1"
    Draw.hasInstance = function(id) {
        return Draw.instances[this._prefix + id] != undefined;
    };

    Draw.getInstance = function(id) {
        return Draw.instances[this._prefix + id];
    };

    Draw.setInstance = function(id, obj) {
        Draw.instances[this._prefix + id] = obj;
    };

    var Default = {
        initialStyle: ".el{ border: 1px dashed #000;} .sq_close{ display: none;position: absolute;right: -5px;top: -5px;width: 15px;height: 15px;background: #a94442;color: #ffffff;cursor: pointer;font-family: Arial,sans-serif;line-height: 15x;vertical-align: baseline;font-size: 16px; text-align: center;} .el:hover .sq_close{ display: block;}  .move{ position: absolute; right: 0px; top: 50%; width: 20px; height: 20px; background: #cecece; cursor: move;opacity: 0.5;margin-top: -10px; }",
        zIndex: 100,
        initialFrameHeight: 600,
        initialFrameWidth: "100%",
        backgroundWidth: 830,
        backgroundHeight: 450,
        backgroundStyle: 'font-size: 14px; font-family: Arial,sans-serif;line-height: 20px;'
    };
    Draw.prototype = {
        _initEvents: function() {
            var me = this;
            
            this.delegateEvents(this.buttonEvents, this.buttonActions);
            this._initUpload();
        },
        _initUI: function() {
            this.createBg();
            this.createOutput();
            this.updateInfo();
        },
        buttonEvents: {
            'click .square': 'createSquare',
            'click .output': 'setOutput',
            'click .savecode': 'saveCode',
            'click .express': 'genExpress',
            'click .refresh': 'refresh',
            'click .preview': 'preview'
        },
        buttonActions: {
            createSquare: function() {
                this.bind(this.createDiv(this.bg));
            },
            setOutput: function() {
                var html = this.outHtml();
                this.setHtmltoOutput(this.filterRules(html));
            },
            saveCode: function() {
                var html = this.outHtml();
                html = this.filterRules(html);
                html = '<!-- generate by print.w3cub.com -->' + html;
                var a = document.createElement("a");
                a.href = "data:text/html;charset=utf8," + encodeURIComponent(html);
                a.download = 'draw_' + com.random(1e8) + '.html';
                a.click();
            },
            genExpress: function() {
                var me = this;
                var ex = this._expressFields();
                var bginfo = this.getBgInfo();
                $.each(ex, function(i, name) {
                    me.createDiv(me.bg, name, bginfo);
                })
                this.rebind();
            },
            refresh: function() {
                this.unbind();
                this.clearDiv();
            },
            preview: function() {
                var html = this.outHtml();
                html = this.filterRules(html);
                var winname = window.open('', "_blank", '');
                winname.document.open('text/html', 'replace');
                winname.opener = null;
                winname.document.write(html);
                winname.document.close(); 
            }
        },
        _expressFields: function() {
            return window.ExpressFields || [
                "寄件人",
                "始发地",
                "寄件单位",
                "寄件地址",
                "寄件人电话",
                "寄件人签名",
                "寄件日期",
                "收件人",
                "目的地",
                "收件单位",
                "收件地址",
                "收件人电话",
                "收件人签名",
                "品名",
                "备注",
            ];
        },
        _setup: function(doc) {
            var me = this,
                options = me.options;

            this.dpi = com.getdpi();

            // if (ie) {
            //     doc.body.disabled = true;
            //     doc.body.contentEditable = true;
            //     doc.body.disabled = false;
            // } else {
            //     doc.body.contentEditable = true;
            // }
            // doc.body.spellcheck = false;
            this.document = doc;
            this.window = doc.defaultView || doc.parentWindow;
            this.iframe = this.window.frameElement;
            this.body = doc.body;
            this.$body = $(this.body);  
            this.elCls = "el";
            this.parent = $('#' + this.id).parent();
            this._initUI();
            this._initEvents();
        },
        _initUpload: function() {
            var me = this;
            var bg = this.bg;

            var uploader = WebUploader.create({
                // runtimeOrder: 'flash',
                pick: {
                    id: '#filePickerReady',
                    multiple: false
                },
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                },
                swf: (~$('link').attr('href').indexOf('assets') ? 'assets/': '') + 'images/Uploader.swf',
                server: 'about:blank;',
                duplicate: true,
                fileSingleSizeLimit: '1mb', // 默认 2 M
                // compress: editor.getOpt('imageCompressEnable') ? {
                //     width: imageCompressBorder,
                //     height: imageCompressBorder,
                //     // 图片质量，只有type为`image/jpeg`的时候才有效。
                //     quality: 90,
                //     // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                //     allowMagnify: false,
                //     // 是否允许裁剪。
                //     crop: false,
                //     // 是否保留头部meta信息。
                //     preserveHeaders: true
                // }:false
            });
            uploader.on('fileQueued', function(file) {
                uploader.makeThumb(file, function(error, src) {
                    if (error || !src) {
                        alert(error);
                        // $wrap.text(lang.uploadNoPreview);
                    } else {
                        bg.css({
                            backgroundImage: 'url(' + src + ')',
                            width: file._info.width,
                            height: file._info.height
                        })
                        me.updateInfo(file._info.width, file._info.height);
                    }
                }, 1, 1); // 100%
            });
        },
        updateInfo: function (width, height) {
            this.$('#dpi').text(this.dpi);
            var info = this.getBgInfo();
            if(arguments.length == 0){
                width = info.width;
                height = info.height; 
            }
            this.$('#width').text(width);
            this.$('#height').text(height);

        },
        filterRules: function(str) {
            var dpi = this.dpi[0];
            str = str.replace(/\<div\s+class\="move"\>\<\/div><div class="sq_close">×<\/div>/g,'')
                      .replace(/contenteditable="true"/g, '')
                      .replace(/background-image:\s*url\([\S]*?\);/g, '');
            if($('[name="unit"]:checked').val() == 0){
                str = str.replace(/(\d+)px/g, function(all, match){
                    return com.px2cm(match, dpi) + 'cm';
                })
            }
            return str;
        },
        getOutput: function() {
            return $('#' + Draw._prefix + this.id + 'code')
        },
        setHtmltoOutput: function(html) {
            this.getOutput().val(html);
        },
        createOutput: function() {
            var code = this.getOutput();
            if (!code.length) {
                $('<textarea>').attr({
                    class: 'form-control',
                    id: Draw._prefix + this.id + 'code',
                    rows: 18
                }).appendTo(this.parent);
            }
        },
        createDiv: function(box, name, info) {
            info || (info = this.getBgInfo());
            var div = $('<div />', {
                class: this.elCls,
                style: 'height: 100px; width: 100px; position:absolute;',
                html: '<div style="height: 100%; width: 100%;" contenteditable="true">' + (name ? name : '') + '</div><div class="move"></div><div class="sq_close">×</div>'
            });
            box.append(div);
            div.css({
                left: com.random(info.width - 100),
                top: com.random(info.height - 100)
            })
            div.on('click', '.sq_close', function(e){
                $(e.currentTarget).parents('.' + this.elCls).remove();
            }.bind(this))
            return div;
        },
        clearDiv: function() {
            this.bg.css('backgroundImage', '');
            this.setHtmltoOutput('');
            this.$body.find('.' + this.elCls).remove();

        },
        createBg: function() {
            var bg = $('<div />', {
                style: 'position: relative; width: ' + this.options.backgroundWidth +'px; height: ' + this.options.backgroundHeight +'px;' + this.options.backgroundStyle
            });
            this.bg = bg;
            this.$body.append(bg);
        },
        getBgInfo: function() {
            return {
                width: parseInt(this.bg.css('width'), 10),
                height: parseInt(this.bg.css('height'), 10)
            }
        },
        rebind: function() {
            this.unbind().bind();
        },
        bind: function(div) {
            if (div) {
                div.draggable({
                    handle: '.move'
                }).resizable();
            } else {
                this.$body.find('.' + this.elCls).each(function() {
                    $(this).draggable({
                        handle: '.move'
                    }).resizable();
                })
            }
            return this;
        },
        unbind: function() {
            try{
                this.$body.find('.' + this.elCls).draggable("destroy").resizable("destroy");
            }catch(e){}
            return this;
        },
        outHtml: function() {
            this.unbind();
            var html = this.bg[0].outerHTML;
            setTimeout(function() {
                this.bind();
            }.bind(this));
            return html;
        },
        getBodyHtml: function() {
            return this.body.innerHTML;
        },
        render: function(container) {
            var me = this,
                options = me.options,
                getStyleValue = function(attr) {
                    return parseInt($(container).css(attr));
                };
            if (com.isString(container)) {
                container = document.getElementById(container);
            }
            if (container) {
                if (options.initialFrameWidth) {
                    options.minFrameWidth = options.initialFrameWidth
                } else {
                    options.minFrameWidth = options.initialFrameWidth = container.offsetWidth;
                }
                if (options.initialFrameHeight) {
                    options.minFrameHeight = options.initialFrameHeight
                } else {
                    options.initialFrameHeight = options.minFrameHeight = container.offsetHeight;
                }
                container.style.width = /%$/.test(options.initialFrameWidth) ? '100%' : options.initialFrameWidth - getStyleValue("paddingLeft") - getStyleValue("paddingRight") + 'px';
                container.style.height = /%$/.test(options.initialFrameHeight) ? '100%' : options.initialFrameHeight - getStyleValue("paddingTop") - getStyleValue("paddingBottom") + 'px';

                container.style.zIndex = options.zIndex;

                var html = ('<!DOCTYPE html>') +
                    '<html xmlns=\'http://www.w3.org/1999/xhtml\' class=\'view\' >' +
                    '<head>' +
                    '<style type=\'text/css\'>' +
                    '.view{padding:0;word-wrap:break-word;cursor:text;height:90%;}\n' +
                    'body{margin:8px;font-family:sans-serif;font-size:16px;}' +
                    'p{margin:5px 0;}</style>' +
                    '<link rel=\'stylesheet\' href=\'//code.jquery.com/ui/1.12.0/themes/smoothness/jquery-ui.css\'>' +
                    (options.initialStyle ? '<style>' + options.initialStyle + '</style>' : '') +
                    '</head>' +
                    '<body class=\'view\' ></body>' +
                    '<script type=\'text/javascript\'  id=\'_initialScript\'>' +
                    'setTimeout(function(){editor = window.parent.Draw.getInstance(\'' + me.id + '\');editor._setup(document);},0);' +
                    'var _tmpScript = document.getElementById(\'_initialScript\');_tmpScript.parentNode.removeChild(_tmpScript);' +
                    '</script>' +
                    (options.iframeJsUrl ? ('<script type=\'text/javascript\' src=\'' + com.unhtml(options.iframeJsUrl) + '\'></script>') : '') +
                    '</html>';

                container.appendChild(com.createElement(document, 'iframe', {
                    id: 'draw_' + me.uid,
                    width: "100%",
                    height: "100%",
                    frameborder: "0",
                    src: 'javascript:void(function(){document.open();' + (options.customDomain && document.domain != location.hostname ? 'document.domain="' + document.domain + '";' : '') +
                        'document.write("' + html + '");document.close();}())'
                }));
                container.style.overflow = 'hidden';
                setTimeout(function() {
                    if (/%$/.test(options.initialFrameWidth)) {
                        options.minFrameWidth = options.initialFrameWidth = container.offsetWidth;
                    }
                    if (/%$/.test(options.initialFrameHeight)) {
                        options.minFrameHeight = options.initialFrameHeight = container.offsetHeight;
                        container.style.height = options.initialFrameHeight + 'px';
                    }
                })

                // container.style.width = opt.initialFrameWidth + (/%$/.test(opt.initialFrameWidth) ? '' : 'px');
                // container.style.zIndex = opt.zIndex;
            }
        }
    };

    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    var Page = {};
    Page.delegateEvents = function(events, context) {
        events || (events = {});
        context || (context = this);
        if (!events) return this;
        for (var key in events) {
            var method = events[key];
            if (!$.isFunction(method)) method = context[method];
            if (!method) continue;
            var match = key.match(delegateEventSplitter);
            this.delegate(match[1], match[2], method.bind(this));
        }
        return this;
    };
    Page.delegate = function(eventName, selector, listener) {
        this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
        return this;
    };
    Page.$ = function (selector){
        return this.$el.find(selector);
    }

    com.copy(Draw.prototype, Page);

    Draw.create = function(id, opt) {
        var drawer = Draw.instances[id];
        if (!drawer) {
            drawer = new Draw(id, opt);
            if (typeof id == "string") {
                id = document.getElementById(id)
            }
            drawer.render(id);
        }
        return drawer;
    }
    window.Draw = Draw;
})();
