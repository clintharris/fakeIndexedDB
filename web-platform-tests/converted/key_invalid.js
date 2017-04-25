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


    var db        = createdb_for_multiple_tests(),
        // cache for ObjectStores
        objStore  = null,
        objStore2 = null;

    function is_cloneable(o) {
        try {
            self.postMessage(o, '*');
            return true;
        } catch (ex) {
            return false;
        }
    }

    function invalid_key(desc, key) {
        var t = async_test(document.title + " - " + desc);

        // set the current test, and run it
        db.setTest(t).onupgradeneeded = function(e) {
            objStore = objStore || e.target.result.createObjectStore("store");
            assert_throws('DataError', function() {
                objStore.add("value", key);
            });

            if (is_cloneable(key)) {
                objStore2 = objStore2 || e.target.result.createObjectStore("store2", { keyPath: ["x", "keypath"] });
                assert_throws('DataError', function() {
                    objStore2.add({ x: "value", keypath: key });
                });
            }
            this.done();
        };
    }

    var fake_array = {
        length      : 0,
        constructor : Array
    };

    var ArrayClone = function(){};
    ArrayClone.prototype = Array;
    var ArrayClone_instance = new ArrayClone();

    // booleans
    invalid_key( 'true'  , true );
    invalid_key( 'false' , false );

    // null/NaN/undefined
    invalid_key( 'null'      , null );
    invalid_key( 'NaN'       , NaN );
    invalid_key( 'undefined' , undefined );
    invalid_key( 'undefined2');

    // functions
    invalid_key( 'function() {}', function(){} );

    // objects
    invalid_key( '{}'                           , {} );
    invalid_key( '{ obj: 1 }'                   , { obj: 1 });
    invalid_key( 'Math'                         , Math );
    invalid_key( 'window'                       , window );
    invalid_key( '{length:0,constructor:Array}' , fake_array );
    invalid_key( 'Array clone’s instance'       , ArrayClone_instance );
    invalid_key( 'Array (object)'               , Array );
    invalid_key( 'String (object)'              , String );
    invalid_key( 'new String()'                 , new String() );
    invalid_key( 'new Number()'                 , new Number() );
    invalid_key( 'new Boolean()'                , new Boolean() );

    // arrays
    invalid_key( '[{}]'                     , [{}] );
    invalid_key( '[[], [], [], [[ Date ]]]' , [ [], [], [], [[ Date ]] ] );
    invalid_key( '[undefined]'              , [undefined] );
    invalid_key( '[,1]'                     , [,1] );

    invalid_key( 'document.getElements'
                +'ByTagName("script")'      , document.getElementsByTagName("script") );

    //  dates
    invalid_key( 'new Date(NaN)'      , new Date(NaN) );
    invalid_key( 'new Date(Infinity)' , new Date(Infinity) );

    // regexes
    invalid_key( '/foo/'        , /foo/ );
    invalid_key( 'new RegExp()' , new RegExp() );

    var sparse = [];
    sparse[10] = "hei";
    invalid_key('sparse array', sparse);

    var sparse2 = [];
    sparse2[0]  = 1;
    sparse2[""] = 2;
    sparse2[2]  = 3;
    invalid_key('sparse array 2', sparse2);

    invalid_key('[[1], [3], [7], [[ sparse array ]]]', [ [1], [3], [7], [[ sparse2 ]] ]);

    // sparse3
    invalid_key( '[1,2,3,,]', [1,2,3,,] );

    var recursive = [];
    recursive.push(recursive);
    invalid_key('array directly contains self', recursive);

    var recursive2 = [];
    recursive2.push([recursive2]);
    invalid_key('array indirectly contains self', recursive2);

    var recursive3 = [recursive];
    invalid_key('array member contains self', recursive3);

