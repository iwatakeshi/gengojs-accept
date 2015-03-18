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
    describe('Test accept as middleware', function() {
        var a = require('../express/');
        var express = require('express');
        var app = express();
        app.use(a());
        app.get('/', function(req, res) {
            res.send({
                result: req.accept.getFromHeader()
            });
        });

        it('Accept should === "en-US"', function(done) {
            request(app)
                .get('/')
                .set('Accept-Language', 'en-US')
                .expect(function(res) {
                    assert.strictEqual(res.body.result, 'en-US');
                })
                .end(done);

        });

    });
    describe('Test getLocale()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            app.use(function(req, res, next) {
                var result = accept(req).getLocale();
                res.send({
                    result: result
                });
            });
            app.get('/');
            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should fallback to "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

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
                var result = accept(req, opt).getLocale();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');

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
                var result = accept(req).getFromQuery('locale');
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/?locale=en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');

                    })
                    .end(done);
            });

            it('Accept should !== "en"', function(done) {
                request(app)
                    .get('/?locale=en')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'en');

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
                }).getFromQuery('locale', true);
                res.send({
                    result: result
                });
            });
            app.get('/');
            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/?locale=en')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should fallback to "ja"', function(done) {
                request(app)
                    .get('/')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'ja');

                    })
                    .end(done);
            });
        });
    });


    describe('Test getAcceptLanguage()', function() {
        var express = require('express');
        var app = express();
        app.use(function(req, res, next) {
            var result = accept(req).getAcceptLanguage();
            res.send({
                result: result
            });
        });

        app.get('/');

        it('Accept should include "en-US"', function(done) {
            request(app)
                .get('/')
                .set('Accept-Language', 'en-US')
                .expect(function(res) {
                    var body = res.body;
                    assert.include(body.result, "en-US");

                })
                .end(done);
        });

        it('Accept should include "ja"', function(done) {
            request(app)
                .get('/')
                .set('Accept-Language', 'ja')
                .expect(function(res) {
                    var body = res.body;
                    assert.include(body.result, "ja");

                })
                .end(done);
        });
    });

    describe('Test getFromDomain()', function() {
        describe('with default options', function() {
            var express = require('express');
            var app = express();
            var subdomainOptions = {
                base: 'localhost.com' //base is required, you'll get an error without it.
            };

            app.use(require('subdomain')(subdomainOptions));
            app.use(function(req, res, next) {
                var result = accept(req, null, true).getFromDomain();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should !== "en"', function(done) {
                request(app)
                    .get('/api/:localhost')
                    .set('Host', 'api.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/api/:localhost')
                    .set('host', 'api.localhost.ja')
                    .set('Accept-Language', 'en-US')

                .expect(function(res) {
                    var body = res.body;
                    assert.notStrictEqual(body.result, 'ja');

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
                var result = accept(req, opt).getFromDomain();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/api/:localhost')
                    .set('Host', 'api.localhost.en')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.ja')
                    .set('Accept-Language', 'en-US')

                .expect(function(res) {
                    var body = res.body;
                    assert.strictEqual(body.result, 'ja');

                })
                    .end(done);
            });
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
                var result = accept(req, null, true).getFromSubdomain();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should !== "en"', function(done) {
                request(app)
                    .get('/en/:localhost')
                    .set('Host', 'en.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.com')
                    .set('Accept-Language', 'en-US')

                .expect(function(res) {
                    var body = res.body;
                    assert.notStrictEqual(body.result, 'ja');

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
                var result = accept(req, opt).getFromSubdomain();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/en/:localhost')
                    .set('Host', 'en.localhost.com')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en');

                    })
                    .end(done);
            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/ja/:localhost')
                    .set('host', 'ja.localhost.com')
                    .set('Accept-Language', 'en-US')

                .expect(function(res) {
                    var body = res.body;
                    assert.strictEqual(body.result, 'ja');

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
                var result = accept(req).getFromUrl();
                res.send({
                    result: result
                });
            });
            app.get('/');
            app.get('/ja');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");
                    }).end(done);

            });

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");

                    }).end(done);
            });
        });

        describe('with configured options', function() {
            var express = require('express');
            var app = express();

            app.use(function(req, res, next) {
                var result = accept(req, {
                    supported: ['en-US', 'ja']
                }).getFromUrl();

                res.send({
                    result: result
                });
            });
            app.get('/');
            app.get('/ja');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");
                    }).end(done);

            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "ja");

                    }).end(done);
            });

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/fr')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");

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
                var result = accept(req).getFromCookie('locale');
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, "ja");
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
                }).getFromCookie('locale');
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "ja");
                    }).end(done);

            });

            it('Accept should === "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "ja");
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
                var result = accept(req).detectLocale();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, 'en-US');
                    }).end(done);

            });

            it('Accept should !== "ja"', function(done) {
                request(app)
                    .get('/')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.notStrictEqual(body.result, "ja");

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
                }).detectLocale();
                res.send({
                    result: result
                });
            });
            app.get('/');

            it('Accept should === "en-US"', function(done) {
                request(app)
                    .get('/en-US')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'en-US')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en-US");
                    }).end(done);

            });

            it('Accept should === "en"', function(done) {
                request(app)
                    .get('/en')
                    .set('cookie', 'locale=ja')
                    .set('Accept-Language', 'ja')
                    .expect(function(res) {
                        var body = res.body;
                        assert.strictEqual(body.result, "en");
                    }).end(done);
            });
        });
    });
});