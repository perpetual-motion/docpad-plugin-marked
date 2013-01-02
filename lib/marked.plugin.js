var http = require('http');
var querystring = require("querystring");

(function () {
    // javascript version of the Coffeescript inheritance implementation.
    var __hasProp = {}.hasOwnProperty,
        __extends = function (child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };

    module.exports = function (BasePlugin) {
        var MarkedPlugin;
        return MarkedPlugin = (function (_super) {

            __extends(MarkedPlugin, _super);

            function MarkedPlugin() {
                return MarkedPlugin.__super__.constructor.apply(this, arguments);
            }

            MarkedPlugin.prototype.name = 'marked';

            MarkedPlugin.prototype.config = {
                markedOptions: {
                    pedantic: false,
                    gfm: true,
                    sanitize: false,

                    // pygments highlighter 
                    highlight: function (source, language, callback) {
                        var text = '';
                        language = language || "text";

                        // this uses the pygments online service to do the coloring...
                        var req = http.request({
                            host: "pygments.appspot.com",
                            port: 80,
                            path: '',
                            method: 'POST'
                        }, function (response) {
                            response.setEncoding('utf8');
                            response.on('data', function (chunk) {
                                text += chunk;
                            });

                            response.on('end', function () {
                                callback(null, text || source);
                            });
                        });

                        req.write(querystring.stringify({
                            lang: language,
                            code: source
                        }));
                        req.end();
                    },

                    // block-style extensions to gfm
                    blocks: {
/*
                        youtube: {
                            search: /^ *\[([^\:\]]+):([^\]]+)\] *\n* /,
                            replace: function (capture, tag, data) {
                                if (tag == 'youtube') {
                                    return '<iframe class="youtube" src="https://www.youtube.com/embed/' + data + '"></iframe>'
                                }
                                return 'undefined:' + tag;
                            }
                        },
*/
                    },

                    // inline-style extensions to gfm
                    inlines: {
                        youtube: {
                            search: / *\[([^\:\]]+):([^\]]+)\] *\n*/,
                            replace: function (capture, tag, data) {
                                if (tag == 'youtube') {
                                    return 'SEE THIS: <iframe class="youtube" src="https://www.youtube.com/embed/' + data + '"></iframe>'
                                }
                                return 'undefined:' + tag;
                            }
                        }
                    }
                }
            };

            MarkedPlugin.prototype.render = function (opts, next) {
                var config, inExtension, marked, outExtension;
                config = this.config;
                inExtension = opts.inExtension, outExtension = opts.outExtension;
                if ((inExtension === 'md' || inExtension === 'markdown') && (outExtension === null || outExtension === 'html')) {
                    marked = require('marked');
                    marked.setOptions(config.markedOptions);
                    return marked.async(opts.content, function (err, markedContent) {
                        opts.content = markedContent;
                        return next();
                    });
                } else {
                    return next();
                }
            };

            return MarkedPlugin;

        })(BasePlugin);
    };
}).call(this);