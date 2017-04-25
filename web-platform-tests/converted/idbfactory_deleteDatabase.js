require("../../build/global");
const Event = require("../../build/lib/FakeEvent").default;
const {
    add_completion_callback,
    assert_array_equals,
    assert_equals,
    assert_false,
    assert_key_equals,
    assert_not_equals,
    assert_throws,
    assert_true,
    async_test,
    createdb,
    createdb_for_multiple_tests,
    fail,
    format_value,
    indexeddb_test,
    promise_test,
    setup,
    step_timeout,
    test,
} = require("../support-node");

const document = {};
const window = global;


    var open_rq = createdb(async_test(), undefined, 9);

    open_rq.onupgradeneeded = function(e) {};
    open_rq.onsuccess = function(e) {
        var db = e.target.result;
        db.close();

        var delete_rq = window.indexedDB.deleteDatabase(db.name);
        delete_rq.onerror = fail(this, "Unexpected delete_rq.error event");
        delete_rq.onsuccess = this.step_func( function (e) {
            assert_equals(e.target.source, null, "event.target.source")
            this.done();
        });
    }
