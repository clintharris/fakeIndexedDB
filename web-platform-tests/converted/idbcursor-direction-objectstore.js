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


var records = [ "Alice", "Bob", "Greg" ];
var directions = ["next", "prev", "nextunique", "prevunique"];
var cases = [
  {dir: 'next', expect: ['Alice', 'Bob', 'Greg']},
  {dir: 'prev', expect: ['Greg', 'Bob', 'Alice']},
  {dir: 'nextunique', expect: ['Alice', 'Bob', 'Greg']},
  {dir: 'prevunique', expect: ['Greg', 'Bob', 'Alice']},
];

cases.forEach(function(testcase) {
  var dir = testcase.dir;
  var expect = testcase.expect;
  indexeddb_test(
    function(t, db, tx) {
      var objStore = db.createObjectStore("test");
      for (var i = 0; i < records.length; i++)
        objStore.add(records[i], records[i]);
    },
    function(t, db) {
      var count = 0;
      var rq = db.transaction("test").objectStore("test").openCursor(undefined, dir);
      rq.onsuccess = t.step_func(function(e) {
        var cursor = e.target.result;
        if (!cursor) {
          assert_equals(count, expect.length, "cursor runs");
          t.done();
        }
        assert_equals(cursor.value, expect[count], "cursor.value");
        count++;
        cursor.continue();
      });
      rq.onerror = t.step_func(function(e) {
        e.preventDefault();
        e.stopPropagation();
        assert_unreached("rq.onerror - " + e.message);
      });
    },
    document.title + ' - ' + dir
  );
});
