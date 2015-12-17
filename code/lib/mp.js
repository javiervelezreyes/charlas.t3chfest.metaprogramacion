var mp = {};

mp.bind = function bind (core, key, ctx) {

    if (typeof (core[key]) === 'function')
        core[key] = core[key].bind(ctx);

};

mp.add = function add (core, key, value) {

    core[key] = value;

};

mp.remove = function remove (core, key) {

    delete core[key];

};

mp.update = function update (core, key, value) {

    if (core[key])
        mp.add (core, key, value);

};

mp.rename = function rename (core, oldKey, newKey) {

    mp.add (core, newKey, core[oldKey]);
    mp.remove (core, oldKey);

};

mp.copy = function copy (core, ext, key) {

    mp.add (core, key, ext[key]);

};

mp.move = function move (core, ext, key) {

    mp.copy (core, ext, key);
    mp.remove (ext, key);

};

mp.extend = function extend (core, ext) {

    var keys = Object.getOwnPropertyNames (ext);
    keys.forEach (function (key) { 
        mp.copy (core, ext, key);
    });
        
};

mp.beforeGetAtt = function beforeGetAtt (core, key, ext) {
    
    Object.defineProperty (core, '_' + key, {
        value: core[key],
        writable: true,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty (core, key, {
        get: function () {
            ext.call (this, arguments);
            return core['_' + key];
        }  
    });
    
};

mp.beforeSetAtt = function beforeSetAtt (core, key, ext) {
    
    Object.defineProperty (core, '_' + key, {
        value: core[key],
        writable: true,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty (core, key, {
        set: function (v) {
            ext.call (this, v);
            core['_' + key] = v;
        }  
    });
    
};

mp.afterGetAtt = function afterGetAtt (core, key, ext) {
    
    Object.defineProperty (core, '_' + key, {
        value: core[key],
        writable: true,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty (core, key, {
        get: function () {
            var r = core['_' + key]; 
            ext.call (this, arguments);
            return r;
        }  
    });
    
};

mp.afterSetAtt = function afterGetAtt (core, key, ext) {
    
    Object.defineProperty (core, '_' + key, {
        value: core[key],
        writable: true,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty (core, key, {
        set: function (v) {
            core['_' + key] = v;
            ext.call (this, v);
        }  
    });
    
};

mp.before = function before (core, key, ext) {
    
    var fn = core[key];
    core[key] = function () {
        ext.apply (this, arguments);
        return fn.apply (this, arguments);
    };
    
};

mp.after = function after (core, key, ext) {
    
    var fn = core[key];
    core[key] = function () {
        var r = fn.apply (this, arguments);
        ext.apply (this, arguments);
        return r;
    };
    
};

mp.around = function around (core, key, ext) {

    var fn = core[key];
    core[key] = function () {
        var args = [].slice.call (arguments);
        args = [ext.bind (this)].concat (args);
        return fn.apply (this, args);
    };

};

mp.provided = function provided (core, key, ext) {
    
    var fn = core[key];
    core[key] = function () {
        if (ext.apply (this, arguments))
            return fn.apply (this, arguments);
    };

};

mp.except = function except (core, key, ext) {

    var fn = core[key];
    core[key] = function () {
        if (!ext.apply (this, arguments))
            return fn.apply (this, arguments);
    };

};

mp.override = function override (core, key, ext) {
    
    core[key] = function () {
        return ext.apply (this, arguments);
    };
},
    
mp.discard = function discard (core, key, ext) {
    
    var fn = core[key];
    core[key] = function () {
        return fn.apply (this, arguments);
    };
    
},

mp.innerDelegate = function innerDelegate (core, oKey, nKey, ctx) {
    
    var context = ctx || core;
    core[nKey] = function () {
        var r = core[oKey].apply (context, arguments);
        return r === core ? this : r;
    };
    
};

mp.outerDelegate = function outerDelegate (core, ext, key, ctx) {
    
    var context = ctx || ext;
    core[key] = function () {
        var r = ext[key].apply (context, arguments);
        return r === ext ? this : r;
    };
    
};

mp.forward = function forward (core, ext, key) {
    
    mp.outerDelegate (core, ext, key, ext);
    
};

mp.forwardProxy = function forwardProxy (core, ext) {
    
    if (typeof(ext) === 'string') ext = core[ext];
    if (ext) {
        var keys = Object.getOwnPropertyNames (ext);
        keys.forEach (function (key) {
            if (typeof (ext[key]) === 'function')
                mp.forward (core, ext, key);
        });
    }
    
};

mp.delegate = function delegate (core, ext, key) {
    
    mp.outerDelegate (core, ext, key, core);
    
};

mp.delegateProxy = function delegateProxy (core, ext) {
    
    if (typeof(ext) === 'string') ext = core[ext];
    if (ext) {
        var keys = Object.getOwnPropertyNames (ext);
        keys.forEach (function (key) {
            if (typeof (ext[key]) === 'function')
                mp.delegate (core, ext, key);
        });
    }
    
};

mp.setPrototype = function setPrototype (core, proto) {
    
    var ch = Object.create (proto);
    mp.extend (ch, core);
    return ch;
  
};

mp.removePrototype = function setPrototype (core) {

    return mp.setPrototype (core, null);
  
};

mp.reversePrototype = function setPrototype (core) {

    var proto = Object.getPrototypeOf (core);
    return mp.setPrototype (proto, core);
  
};

mp.copyUp = function copyUp (core, key) {
    
    var proto = Object.getPrototypeOf (core);
    if (proto) 
        mp.add (proto, key, core[key]);
    
};

mp.copyDown = function copyDown (core, key, child) {
    
    mp.add (child, key, core[key]);
    
};

mp.moveUp = function moveUp (core, key) {
    
    mp.copyUp (core, key);
    mp.remove (core, key);
    
};

mp.moveDown = function moveDown (core, key, child) {
    
    mp.add (child, key, core[key]);
    mp.remove (core, key);
    
};

mp.context = function context () {
    
    mp.n = mp.n || 0;
    return 'ctx' + (mp.n++);
    
};

mp.mixin = function (core, ext, policy) {
    
    var context = mp.context ();
    core[context] = { self: core };
    var decorate = policy || mp.after;
    var keys = Object.getOwnPropertyNames(ext);
    keys.forEach (function (key) {
        if (typeof (ext[key]) === 'function') {
            if (core[key])
                decorate (core, key, ext[key]);
            else
               mp.outerDelegate (core, ext, key, core[context]);
        }
        else mp.copy (core[context], ext, key);
    });  
    
};

mp.advisable = function advisable (core, ext, key) {
    
    function method () {
        var args = [].slice.call (arguments);
        method.befores.forEach (function (fn) {
            fn.apply (this, args);
        });
        method.body.apply (this, args);
        method.afters.forEach (function (fn) {
            fn.apply (this, args);
        });
    }
    
    method.isAdvisable = true;
    method.befores = [];
    method.body    = core[key];
    method.afters  = [];
    
    method.before = function (fn) {
        this.befores.unshift (fn);
        return this;
    };
    method.after = function (fn) {
        this.afters.push (fn);
        return this;
    };
    
    core[key] = method;
};

mp.sAspect = function sAspect (core, ext) {
    
    var keys = Object.getOwnPropertyNames (ext);
    keys.forEach (function (key) {
        mp[ext[key].when](core, key, ext[key].advice);
    });
    
};

mp.dAspect = function dAspect (core, ext) {
    
    var keys = Object.getOwnPropertyNames (ext);
    keys.forEach (function (key) {
        if (!core[key].isAdvisable) 
            mp.advisable (core, ext, key); 
        core[key][ext[key].when](ext[key].advice);
    });
    
};

mp.filter = function (core, ext) {

  mp.extend (core, ext.state); 
  mp.sAspect (core, ext.advices); 
  
};
