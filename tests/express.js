var accept = require('../index');
var request = require('supertest');
var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

describe('Begin module "accept" tests with express', function() {
    describe('Test options', function() {
        it('The default "default" should === "en-US"', function(done) {
            var result = accept();
            assert.strictEqual(result.opt.default, 'en-US');
            done();
        });

        it('The configured "default" should === "ja"', function(done) {
            var result = accept(null, {
                default: 'ja'
            });
            assert.strictEqual(result.opt.default, 'ja');
            done();
        });

        it('The default "supported" should === "["en-US"]"', function(done) {
            var result = accept();
            assert.deepEqual(result.opt.supported, ['en-US']);
            done();
        });

        it('The configured "default" should === "["en-US", "ja"]"', function(done) {
            var result = accept(null, {
                supported: ['en-US', 'ja']
            });
            assert.deepEqual(result.opt.supported, ['en-US', 'ja']);
            done();
        });
    });

    describe('Test getLocale()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            app.use(function(req, res, next) {
                var result = accept(req);
                var filter = {
                    getLocale: result.getLocale()
                };
                res.send(filter);
            });
            app.get('/');
            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getLocale, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should fallback to "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getLocale, 'en-US');

                    })
                    .end(done);
            });
        });
        describe('with configured options', function() {
            var express = require('express');
            var app = express();

            app.use(function(req, res, next) {
                var opt = {
                    supported: ['en-US', 'ja']
                };
                var result = accept(req, opt);

                var filter = {
                    getLocale: result.getLocale(),
                    getAcceptLanguage: result.getAcceptLanguage(),
                    getFromQuery: result.getFromQuery(),
                    getFromSubdomain: result.getFromSubdomain(),
                    getFromCookie: result.getFromCookie(),
                    getFromUrl: result.getFromUrl()
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getLocale, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getLocale, 'ja');

                    })
                    .end(done);
            });
        });
    });

    describe('Test getFromQuery()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            app.use(function(req, res, next) {
                var result = accept(req);
                var filter = {
                    getFromQuery: result.getFromQuery('locale'),
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/?locale=en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromQuery, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should !== "en"', function(done) {
                request(app)
                    .get('/?locale=en')
                    .expect(function(res) {
                        var result = res.body;
                        assert.notStrictEqual(result.getFromQuery, 'en');

                    })
                    .end(done);
            });


        });

        describe('with configured options', function() {
            var express = require('express');
            var app = express();
            app.use(function(req, res, next) {
                var result = accept(req, {
                    default: 'ja',
                    supported: ['en-US', 'en']
                });
                var filter = {
                    getFromQuery: result.getFromQuery('locale', true),
                };
                res.send(filter);
            });
            app.get('/');
            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/?locale=en')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromQuery, 'en');

                    })
                    .end(done);
            });

            it('Accept should fallback to "ja"', function(done) {
                request(app)
                    .get('/')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromQuery, 'ja');

                    })
                    .end(done);
            });
        });
    });


    describe('Test getAcceptLanguage()', function() {
        var express = require('express');
        var app = express();
        app.use(function(req, res, next) {
            var result = accept(req);
            var filter = {
                getAcceptLanguage: result.getAcceptLanguage(),
            };
            res.send(filter);
        });

        app.get('/');

        it('Accept should include "en-US"', function(done) {
            request(app)
                .get('/')
                .set('Accept-Language', 'en-US')
                .expect(function(res) {
                    var result = res.body;
                    assert.include(result.getAcceptLanguage, "en-US");

                })
                .end(done);
        });

        it('Accept should include "ja"', function(done) {
            request(app)
                .get('/')
                .set('Accept-Language', 'ja')
                .expect(function(res) {
                    var result = res.body;
                    assert.include(result.getAcceptLanguage, "ja");

                })
                .end(done);
        });
    });


    describe('Test getFromSubdomain()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(require('subdomain')(subdomainOptions));
            app.use(function(req, res, next) {
                var result = accept(req, null, true)
                var filter = {
                    getFromSubdomain: result.getFromSubdomain()
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should !== "en"', function(done) {
                request(app)
                    .get('/en/:localhost')
                    .set('Host', 'en.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.notStrictEqual(result.getFromSubdomain, 'en');

                    })
                    .end(done);
            });

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.com')
                    .set('Accept-Language', 'en-US')

                .expect(function(res) {
                        var result = res.body;
                        assert.notStrictEqual(result.getFromSubdomain, 'ja');

                    })
                    .end(done);
            });
        });
        describe('with configured options', function() {
            var express = require('express');
            var app = express();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(require('subdomain')(subdomainOptions));
            app.use(function(req, res, next) {
                var opt = {
                    supported: ['en-US', 'ja', 'en']
                };
                var result = accept(req, opt);

                var filter = {
                    getFromSubdomain: result.getFromSubdomain()
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/en/:localhost')
                    .set('Host', 'en.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromSubdomain, 'en');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.com')
                    .set('Accept-Language', 'en-US')

                .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromSubdomain, 'ja');

                    })
                    .end(done);
            });
        });
    });

    describe('Test getFromUrl()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();

            app.use(function(req, res, next) {
                var result = accept(req);
                var filter = {
                    getFromUrl: result.getFromUrl()
                };
                res.send(filter);
            });
            app.get('/');
            app.get('/ja');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromUrl, "en-US");
                    }).end(done);

            });

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromUrl, "en-US");

                    }).end(done);
            });
        });

        describe('with configured options', function() {
            var express = require('express');
            var app = express();

            app.use(function(req, res, next) {
                var result = accept(req, {
                    supported: ['en-US', 'ja']
                });
                var filter = {
                    getFromUrl: result.getFromUrl()
                };

                res.send(filter);
            });
            app.get('/');
            app.get('/ja');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromUrl, "en-US");
                    }).end(done);

            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromUrl, "ja");

                    }).end(done);
            });

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/fr')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromUrl, "en-US");

                    }).end(done);
            });
        });
    });

    describe('Test getFromCookie()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            var cookieParser = require('cookie-parser');
            app.use(cookieParser());

            app.use(function(req, res, next) {
                var result = accept(req);
                var filter = {
                    getFromCookie: result.getFromCookie('locale'),
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.notStrictEqual(result.getFromCookie, "ja");
                    }).end(done);

            });
        });

        describe('with configured options', function() {
            var express = require('express');
            var app = express();
            var cookieParser = require('cookie-parser');
            app.use(cookieParser());

            app.use(function(req, res, next) {
                var result = accept(req, {
                    supported: ['en-US', 'ja'],
                    default: 'en'
                });
                var filter = {
                    getFromCookie: result.getFromCookie('locale'),
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromCookie, "ja");
                    }).end(done);

            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.getFromCookie, "ja");
                    }).end(done);
            });
        });
    });
    describe('Test detectLocale()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            var cookieParser = require('cookie-parser');
            app.use(cookieParser());

            app.use(function(req, res, next) {
                var result = accept(req);
                var filter = {
                    detectLocale: result.detectLocale()
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.detectLocale, 'en-US');
                    }).end(done);

            });

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var result = res.body;
                        assert.notStrictEqual(result.detectLocale, "ja");

                    }).end(done);
            });
        });

        describe('with configured options', function() {
            var express = require('express');
            var app = express();
            var cookieParser = require('cookie-parser');
            app.use(cookieParser());

            app.use(function(req, res, next) {
                var result = accept(req, {
                    supported: ['en-US', 'ja'],
                    default: 'en',
                    detect: {
                        header: false,
                        url: true
                    }
                });
                var filter = {
                    detectLocale: result.detectLocale()
                };
                res.send(filter);
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/en-US')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.detectLocale, "en-US");
                    }).end(done);

            });

            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/en')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var result = res.body;
                        assert.strictEqual(result.detectLocale, "en");
                    }).end(done);
            });
        });
    });
});