require("../../build/global.js");
const {
    add_completion_callback,
    assert_array_equals,
    assert_equals,
    assert_false,
    assert_not_equals,
    assert_throws,
    assert_true,
    async_test,
    createdb,
    createdb_for_multiple_tests,
    fail,
    format_value,
    indexeddb_test,
    setup,
    test,
} = require("../support-node.js");

const document = {};
const window = global;


    var db,
        t = async_test(),
        records = [ { pKey: "primaryKey_0", iKey: "indexKey_0" },
                    { pKey: "primaryKey_1", iKey: "indexKey_1" } ];

    var open_rq = createdb(t);
    open_rq.onupgradeneeded = function(e) {
        db = e.target.result;

        var objStore = db.createObjectStore("store", { keyPath: "pKey" });
        objStore.createIndex("index", "iKey");

        for (var i = 0; i < records.length; i++)
            objStore.add(records[i]);
    };

    open_rq.onsuccess = function(e) {
        var cursor_rq = db.transaction("store", "readwrite")
                          .objectStore("store")
                          .index("index")
                          .openCursor();

        cursor_rq.onsuccess = t.step_func(function(e) {
            var cursor = e.target.result;
            assert_true(cursor instanceof IDBCursor, "cursor exists");

            cursor.continue();
            assert_throws("InvalidStateError", function() {
                cursor.update({ pKey: "primaryKey_0", iKey: "indexKey_0_updated" });
            });

            t.done();
        });
    }