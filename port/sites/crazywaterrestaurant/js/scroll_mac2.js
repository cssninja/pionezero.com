//  1 `````````````````````




//  dw_event.js version date Apr 2008
//  basic event handling file from dyn-web.com

var dw_Event = {
  
    add: function(obj, etype, fp, cap) {
        cap = cap || false;
        if (obj.addEventListener) obj.addEventListener(etype, fp, cap);
        else if (obj.attachEvent) obj.attachEvent("on" + etype, fp);
    }, 

    remove: function(obj, etype, fp, cap) {
        cap = cap || false;
        if (obj.removeEventListener) obj.removeEventListener(etype, fp, cap);
        else if (obj.detachEvent) obj.detachEvent("on" + etype, fp);
    }, 
    
    DOMit: function(e) { 
        e = e? e: window.event; // e IS passed when using attachEvent though ...
        if (!e.target) e.target = e.srcElement;
        if (!e.preventDefault) e.preventDefault = function () { e.returnValue = false; return false; }
        if (!e.stopPropagation) e.stopPropagation = function () { e.cancelBubble = true; }
        return e;
    },
    
    getTarget: function(e) {
        e = dw_Event.DOMit(e); var tgt = e.target; 
        if (tgt.nodeType != 1) tgt = tgt.parentNode; // safari...
        return tgt;
    }
    
}

// Danny Goodman's version (DHTML def ref)
function addLoadEvent(func) {
    var oldQueue = window.onload? window.onload: function() {};
    window.onload = function() {
        oldQueue();
        func();
    }
}




//  2 `````````````````````




/*************************************************************************
    This code is from Dynamic Web Coding at dyn-web.com
    Copyright 2001-2008 by Sharon Paine 
    See Terms of Use at www.dyn-web.com/business/terms.php
    regarding conditions under which you may use this code.
    This notice must be retained in the code as is!
    
    version date: Aug 2008
*************************************************************************/

// horizId only needed for horizontal scrolling
function dw_scrollObj(wndoId, lyrId, horizId) {
    var wn = document.getElementById(wndoId);
    this.id = wndoId; dw_scrollObj.col[this.id] = this;
    this.animString = "dw_scrollObj.col." + this.id;
    this.load(lyrId, horizId);
    
    if (wn.addEventListener) {
        wn.addEventListener('DOMMouseScroll', dw_scrollObj.doOnMouseWheel, false);
    } 
    wn.onmousewheel = dw_scrollObj.doOnMouseWheel;
}

dw_scrollObj.isSupported = function () {
    if ( document.getElementById && document.getElementsByTagName 
         && document.addEventListener || document.attachEvent ) {
        return true;
    }
    return false;
}

dw_scrollObj.col = {}; // collect instances
dw_scrollObj.defaultSpeed = dw_scrollObj.prototype.speed = 100; // default for mouseover or mousedown scrolling
dw_scrollObj.defaultSlideDur = dw_scrollObj.prototype.slideDur = 500; // default duration of glide onclick

// pseudo events 
dw_scrollObj.prototype.on_load = function() {} // when dw_scrollObj initialized or new layer loaded
dw_scrollObj.prototype.on_scroll = function() {}
dw_scrollObj.prototype.on_scroll_start = function() {}
dw_scrollObj.prototype.on_scroll_stop = function() {} // when scrolling has ceased (mouseout/up)
dw_scrollObj.prototype.on_scroll_end = function() {} // reached end
dw_scrollObj.prototype.on_update = function() {} // called in updateDims

dw_scrollObj.prototype.on_glidescroll = function() {}
dw_scrollObj.prototype.on_glidescroll_start = function() {}
dw_scrollObj.prototype.on_glidescroll_stop = function() {} // destination (to/by) reached
dw_scrollObj.prototype.on_glidescroll_end = function() {} // reached end

dw_scrollObj.prototype.load = function(lyrId, horizId) {
    var wndo, lyr;
    if (this.lyrId) { // layer currently loaded?
        lyr = document.getElementById(this.lyrId);
        lyr.style.visibility = "hidden";
    }
    this.lyr = lyr = document.getElementById(lyrId); // hold this.lyr?
    this.lyr.style.position = 'absolute'; 
    this.lyrId = lyrId; // hold id of currently visible layer
    this.horizId = horizId || null; // hold horizId for update fn
    wndo = document.getElementById(this.id);
    this.y = 0; this.x = 0; this.shiftTo(0,0);
    this.getDims(wndo, lyr); 
    lyr.style.visibility = "visible";
    this.ready = true; this.on_load(); 
}

dw_scrollObj.prototype.shiftTo = function(x, y) {
    if (this.lyr) {
        this.lyr.style.left = (this.x = x) + "px"; 
        this.lyr.style.top = (this.y = y) + "px";
    }
}

dw_scrollObj.prototype.getX = function() { return this.x; }
dw_scrollObj.prototype.getY = function() { return this.y; }

dw_scrollObj.prototype.getDims = function(wndo, lyr) { 
    this.wd = this.horizId? document.getElementById( this.horizId ).offsetWidth: lyr.offsetWidth;
    this.maxX = (this.wd - wndo.offsetWidth > 0)? this.wd - wndo.offsetWidth: 0;
    this.maxY = (lyr.offsetHeight - wndo.offsetHeight > 0)? lyr.offsetHeight - wndo.offsetHeight: 0;
}

dw_scrollObj.prototype.updateDims = function() {
    var wndo = document.getElementById(this.id);
    var lyr = document.getElementById( this.lyrId );
    this.getDims(wndo, lyr);
    this.on_update();
}

// for mouseover/mousedown scrolling
dw_scrollObj.prototype.initScrollVals = function(deg, speed) {
    if (!this.ready) return; 
    if (this.timerId) {
        clearInterval(this.timerId); this.timerId = 0;
    }
    this.speed = speed || dw_scrollObj.defaultSpeed;
    this.fx = (deg == 0)? -1: (deg == 180)? 1: 0;
    this.fy = (deg == 90)? 1: (deg == 270)? -1: 0;
    this.endX = (deg == 90 || deg == 270)? this.x: (deg == 0)? -this.maxX: 0; 
    this.endY = (deg == 0 || deg == 180)? this.y: (deg == 90)? 0: -this.maxY;
    this.lyr = document.getElementById(this.lyrId);
    this.lastTime = new Date().getTime();
    this.on_scroll_start(this.x, this.y);  
    this.timerId = setInterval(this.animString + ".scroll()", 10);    
}

dw_scrollObj.prototype.scroll = function() {
    var now = new Date().getTime();
    var d = (now - this.lastTime)/1000 * this.speed;
    if (d > 0) { 
        var x = this.x + Math.round(this.fx * d); var y = this.y + Math.round(this.fy * d);
        if ( ( this.fx == -1 && x > -this.maxX ) || ( this.fx == 1 && x < 0 ) || 
                ( this.fy == -1 && y > -this.maxY ) || ( this.fy == 1 && y < 0 ) ) 
       {
            this.lastTime = now;
            this.shiftTo(x, y);
            this.on_scroll(x, y);
        } else {
            clearInterval(this.timerId); this.timerId = 0;
            this.shiftTo(this.endX, this.endY);
            this.on_scroll(this.endX, this.endY);
            this.on_scroll_end(this.endX, this.endY);
        }
    }
}

// when scrolling has ceased (mouseout/up)
dw_scrollObj.prototype.ceaseScroll = function() {
    if (!this.ready) return;
    if (this.timerId) {
        clearInterval(this.timerId); this.timerId = 0; 
    }
    this.on_scroll_stop(this.x, this.y); 
}

// glide onclick scrolling
dw_scrollObj.prototype.initScrollByVals = function(dx, dy, dur) {
    if ( !this.ready || this.sliding ) return;
    this.startX = this.x; this.startY = this.y;
    this.destX = this.destY = this.distX = this.distY = 0;
    if (dy < 0) {
        this.distY = (this.startY + dy >= -this.maxY)? dy: -(this.startY  + this.maxY);
    } else if (dy > 0) {
        this.distY = (this.startY + dy <= 0)? dy: -this.startY;
    }
    if (dx < 0) {
        this.distX = (this.startX + dx >= -this.maxX)? dx: -(this.startX + this.maxX);
    } else if (dx > 0) {
        this.distX = (this.startX + dx <= 0)? dx: -this.startX;
    }
    this.destX = this.startX + this.distX; this.destY = this.startY + this.distY;
    this.glideScrollPrep(this.destX, this.destY, dur);
}

dw_scrollObj.prototype.initScrollToVals = function(destX, destY, dur) {
    if ( !this.ready || this.sliding ) return;
    this.startX = this.x; this.startY = this.y;
    this.destX = -Math.max( Math.min(destX, this.maxX), 0);
    this.destY = -Math.max( Math.min(destY, this.maxY), 0);
    this.distY = this.destY - this.startY;
    this.distX = this.destX - this.startX;
    this.glideScrollPrep(this.destX, this.destY, dur);
}

dw_scrollObj.prototype.glideScrollPrep = function(destX, destY, dur) {
    this.slideDur = (typeof dur == 'number')? dur: dw_scrollObj.defaultSlideDur;
    this.per = Math.PI/(2 * this.slideDur); this.sliding = true;
    this.lyr = document.getElementById(this.lyrId); 
    this.startTime = new Date().getTime();
    this.timerId = setInterval(this.animString + ".doGlideScroll()",10);
    this.on_glidescroll_start(this.startX, this.startY);
}

dw_scrollObj.prototype.doGlideScroll = function() {
    var elapsed = new Date().getTime() - this.startTime;
    if (elapsed < this.slideDur) {
        var x = this.startX + Math.round( this.distX * Math.sin(this.per*elapsed) );
        var y = this.startY + Math.round( this.distY * Math.sin(this.per*elapsed) );
        this.shiftTo(x, y); 
        this.on_glidescroll(x, y);
    } else {	// if time's up
        clearInterval(this.timerId); this.timerId = 0; this.sliding = false;
        this.shiftTo(this.destX, this.destY);
        this.on_glidescroll(this.destX, this.destY);
        this.on_glidescroll_stop(this.destX, this.destY);
        // end of axis reached ? 
        if ( this.distX && (this.destX == 0 || this.destX == -this.maxX) 
          || this.distY && (this.destY == 0 || this.destY == -this.maxY) ) { 
            this.on_glidescroll_end(this.destX, this.destY);
        } 
    }
}

//  resource: http://adomas.org/javascript-mouse-wheel/
dw_scrollObj.handleMouseWheel = function(id, delta) {
    var wndo = dw_scrollObj.col[id];
    var x = wndo.x;
    var y = wndo.y;
    wndo.on_scroll_start(x,y);
    var ny;
    ny = 12  * delta + y
    ny = (ny < 0 && ny >= -wndo.maxY)? ny: (ny < -wndo.maxY)? -wndo.maxY: 0;
    wndo.shiftTo(x, ny);
    wndo.on_scroll(x, ny);
}

dw_scrollObj.doOnMouseWheel = function(e) {
    var delta = 0;
    if (!e) e = window.event;
    if (e.wheelDelta) { /* IE/Opera. */
        delta = e.wheelDelta/120;
        if (window.opera) delta = -delta;
    } else if (e.detail) { // Mozilla 
        delta = -e.detail/3;
    }
    if (delta) { // > 0 up, < 0 down
        dw_scrollObj.handleMouseWheel(this.id, delta);
    }
    if (e.preventDefault) e.preventDefault();
    e.returnValue = false;
}

dw_scrollObj.GeckoTableBugFix = function() {} // no longer need old bug fix


// Get position of el within layer (oCont) sOff: 'left' or 'top'
// Assumes el is within oCont
function dw_getLayerOffset(el, oCont, sOff) {
    var off = "offset" + sOff.charAt(0).toUpperCase() + sOff.slice(1);
    var val = el[off];
    while ( (el = el.offsetParent) != oCont ) 
        val += el[off];
    var clientOff = off.replace("offset", "client");
    if ( el[clientOff] ) val += el[clientOff];
    return val;
}

/////////////////////////////////////////////////////////////////////
// Reminder about licensing requirements
// See Terms of Use at www.dyn-web.com/business/terms.php
// OK to remove after purchasing a license or if using on a personal site.
/* function dw_checkAuth() {
    var loc = window.location.hostname.toLowerCase();
    var msg = 'A license is required for commercial use of this code.\n' + 
        'Please adhere to our Terms of Use if you use dyn-web code.';
    if ( !( loc == '' || loc == '127.0.0.1' || loc.indexOf('localhost') != -1 
         || loc.indexOf('192.168.') != -1 || loc.indexOf('dyn-web.com') != -1 ) ) {
        alert(msg);
    }
}
dw_Event.add( window, 'load', dw_checkAuth); */
/////////////////////////////////////////////////////////////////////




//  3 `````````````````````




/*************************************************************************
    This code is from Dynamic Web Coding at dyn-web.com
    Copyright 2001-2008 by Sharon Paine 
    See Terms of Use at www.dyn-web.com/business/terms.php
    regarding conditions under which you may use this code.
    This notice must be retained in the code as is!
    
    for use with dw_scroll.js - provides scrollbar functionality
    version date: Aug 2008
        bug fixed in .setBarSize
*************************************************************************/

function dw_Slidebar(barId, trackId, axis, x, y) {
    var bar = document.getElementById(barId);
    var track = document.getElementById(trackId);
    this.barId = barId; this.trackId = trackId;
    this.axis = axis; this.x = x || 0; this.y = y || 0;
    dw_Slidebar.col[this.barId] = this;
    this.bar = bar;  this.shiftTo(x, y);
    
    // hold for setBarSize  
    this.trkHt = track.offsetHeight; 
    this.trkWd = track.offsetWidth; 
  
    if (axis == 'v') {
        this.maxY = this.trkHt - bar.offsetHeight - y; 
        this.maxX = x; this.minX = x; this.minY = y;
    } else {
        this.maxX = this.trkWd - bar.offsetWidth - x; 
        this.minX = x; this.maxY = y; this.minY = y;
    }
    
    this.on_drag_start =  this.on_drag =   this.on_drag_end = 
    this.on_slide_start = this.on_slide =  this.on_slide_end = function() {}
    
    bar.onmousedown = dw_Slidebar.prepDrag; 
    // pass barId to obtain instance from dw_Slidebar.col
    track.onmousedown = function(e) { dw_Slidebar.prepSlide(barId, e); }
    this.bar = bar = null; track = null; 
}

dw_Slidebar.col = {}; // hold instances for global access
dw_Slidebar.current = null; // hold current instance

dw_Slidebar.prototype.slideDur = 500;

// track received onmousedown event
dw_Slidebar.prepSlide = function(barId, e) {
    var _this = dw_Slidebar.col[barId];
    dw_Slidebar.current = _this;
    var bar = _this.bar = document.getElementById(barId);
    
    if ( _this.timer ) { clearInterval(_this.timer); _this.timer = 0; }
    e = e? e: window.event;
    
    e.offX = (typeof e.layerX != "undefined")? e.layerX: e.offsetX;
    e.offY = (typeof e.layerY != "undefined")? e.layerY: e.offsetY;
    _this.startX = parseInt(bar.style.left); _this.startY = parseInt(bar.style.top);

    if (_this.axis == "v") {
        _this.destX = _this.startX;
        _this.destY = (e.offY < _this.startY)? e.offY: e.offY - bar.offsetHeight;
        _this.destY = Math.min( Math.max(_this.destY, _this.minY), _this.maxY );
    } else {
        _this.destX = (e.offX < _this.startX)? e.offX: e.offX - bar.offsetWidth;
        _this.destX = Math.min( Math.max(_this.destX, _this.minX), _this.maxX );
        _this.destY = _this.startY;
    }
    _this.distX = _this.destX - _this.startX; _this.distY = _this.destY - _this.startY;
    _this.per = Math.PI/(2 * _this.slideDur);
    _this.slideStartTime = new Date().getTime();
    _this.on_slide_start(_this.startX, _this.startY);
    _this.timer = setInterval("dw_Slidebar.doSlide()", 10);
}

dw_Slidebar.doSlide = function() {
    var _this = dw_Slidebar.current;
    var elapsed = new Date().getTime() - _this.slideStartTime;
    if (elapsed < _this.slideDur) {
        var x = _this.startX + _this.distX * Math.sin(_this.per*elapsed);
        var y = _this.startY + _this.distY * Math.sin(_this.per*elapsed);
        _this.shiftTo(x,y);
        _this.on_slide(x, y);
    } else {	// if time's up
        clearInterval(_this.timer);
        _this.shiftTo(_this.destX,  _this.destY);
        _this.on_slide(_this.destX,  _this.destY);
        _this.on_slide_end(_this.destX, _this.destY);
        dw_Slidebar.current = null;
    }    
}

dw_Slidebar.prepDrag = function (e) { 
    var bar = this; // bar received onmousedown event
    var barId = this.id; // id of element mousedown event assigned to
    var _this = dw_Slidebar.col[barId]; // Slidebar instance
    dw_Slidebar.current = _this;
    _this.bar = bar;
    e = dw_Event.DOMit(e);
    if ( _this.timer ) { clearInterval(_this.timer); _this.timer = 0; }
    _this.downX = e.clientX; _this.downY = e.clientY;
    _this.startX = parseInt(bar.style.left);
    _this.startY = parseInt(bar.style.top);
    _this.on_drag_start(_this.startX, _this.startY);
    dw_Event.add( document, "mousemove", dw_Slidebar.doDrag, true );
    dw_Event.add( document, "mouseup",   dw_Slidebar.endDrag,  true );
    e.stopPropagation(); e.preventDefault();
}

dw_Slidebar.doDrag = function(e) {
    if ( !dw_Slidebar.current ) return; // avoid errors in ie if inappropriate selections
    var _this = dw_Slidebar.current;
    var bar = _this.bar;
    e = dw_Event.DOMit(e);
    var nx = _this.startX + e.clientX - _this.downX;
    var ny = _this.startY + e.clientY - _this.downY;
    nx = Math.min( Math.max( _this.minX, nx ), _this.maxX);
    ny = Math.min( Math.max( _this.minY, ny ), _this.maxY);
    _this.shiftTo(nx, ny);
    _this.on_drag(nx, ny);
    e.preventDefault(); e.stopPropagation();
}

dw_Slidebar.endDrag = function() {
    if ( !dw_Slidebar.current ) return; // avoid errors in ie if inappropriate selections
    var _this = dw_Slidebar.current;
    var bar = _this.bar;
    dw_Event.remove( document, "mousemove", dw_Slidebar.doDrag, true );
    dw_Event.remove( document, "mouseup",   dw_Slidebar.endDrag,  true );
    _this.on_drag_end( parseInt(bar.style.left), parseInt(bar.style.top) );
    dw_Slidebar.current = null;
}

dw_Slidebar.prototype.shiftTo = function(x, y) {
    if ( this.bar ) {
        this.bar.style.left = x + "px";
        this.bar.style.top = y + "px";
    }
}

/////////////////////////////////////////////////////////////////////
//  connect slidebar with scrollObj
dw_scrollObj.prototype.setUpScrollbar = function(barId, trkId, axis, offx, offy, bSize) {
    var scrollbar = new dw_Slidebar(barId, trkId, axis, offx, offy);
    if (axis == "v") {
        this.vBarId = barId; 
    } else {
        this.hBarId = barId;
    }
    scrollbar.wndoId = this.id;
    scrollbar.bSizeDragBar = (bSize == false)? false: true; 
    if (scrollbar.bSizeDragBar) {
        dw_Scrollbar_Co.setBarSize(this, scrollbar);
    }
    dw_Scrollbar_Co.setEvents(this, scrollbar);
}

// Coordinates slidebar and scrollObj 
dw_Scrollbar_Co = {
    
    // This function is called for each scrollbar attached to a scroll area (change from previous version)
    setBarSize: function(scrollObj, barObj) {
        var lyr = document.getElementById(scrollObj.lyrId);
        var wn = document.getElementById(scrollObj.id);
        if ( barObj.axis == 'v' ) {
            var bar = document.getElementById(scrollObj.vBarId);
            bar.style.height = (lyr.offsetHeight > wn.offsetHeight)? 
                barObj.trkHt / ( lyr.offsetHeight / wn.offsetHeight ) + "px":             
                barObj.trkHt - ( 2 * barObj.minY ) + "px";
            barObj.maxY = barObj.trkHt - bar.offsetHeight - barObj.minY; 
        } else if ( barObj.axis == 'h' ) {
            var bar = document.getElementById(scrollObj.hBarId);
            bar.style.width = (scrollObj.wd > wn.offsetWidth)? 
                barObj.trkWd / ( scrollObj.wd / wn.offsetWidth ) + "px": 
                barObj.trkWd - ( 2 * barObj.minX ) + "px";
            barObj.maxX = barObj.trkWd - bar.offsetWidth - barObj.minX;
        }
    },
    
    // Find bars associated with this scrollObj. if they have bSizeDragBar set true reevaluate size and reset position to top 
    resetBars: function(scrollObj) {
        var barObj, bar;
        if (scrollObj.vBarId) {
            barObj = dw_Slidebar.col[scrollObj.vBarId];
            bar = document.getElementById(scrollObj.vBarId);
            bar.style.left = barObj.minX + "px"; bar.style.top = barObj.minY + "px";
            if (barObj.bSizeDragBar) {
                dw_Scrollbar_Co.setBarSize(scrollObj, barObj);
            }
        }
        if (scrollObj.hBarId) {
            barObj = dw_Slidebar.col[scrollObj.hBarId];
            bar = document.getElementById(scrollObj.hBarId);
            bar.style.left = barObj.minX + "px"; bar.style.top = barObj.minY + "px";
            if (barObj.bSizeDragBar) {
                dw_Scrollbar_Co.setBarSize(scrollObj, barObj);
            }
        }
    },
    
    setEvents: function(scrollObj, barObj) {
        // scrollObj
        this.addEvent(scrollObj, 'on_load', function() { dw_Scrollbar_Co.resetBars(scrollObj); } );
        this.addEvent(scrollObj, 'on_scroll_start', function() { dw_Scrollbar_Co.getBarRefs(scrollObj) } );
        this.addEvent(scrollObj, 'on_glidescroll_start', function() { dw_Scrollbar_Co.getBarRefs(scrollObj) } );
        this.addEvent(scrollObj, 'on_scroll', function(x,y) { dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y) } );
        this.addEvent(scrollObj, 'on_glidescroll', function(x,y) { dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y) } );
        this.addEvent(scrollObj, 'on_scroll_stop', function(x,y) { dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y); } );
        this.addEvent(scrollObj, 'on_glidescroll_stop', function(x,y) { dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y); } );
        this.addEvent(scrollObj, 'on_scroll_end', function(x,y) { dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y); } );
        this.addEvent(scrollObj, 'on_glidescroll_end', function(x,y) { dw_Scrollbar_Co.updateScrollbar(scrollObj, x, y); } );
            
        // barObj 
        this.addEvent(barObj, 'on_slide_start', function() { dw_Scrollbar_Co.getWndoLyrRef(barObj) } );
        this.addEvent(barObj, 'on_drag_start', function() { dw_Scrollbar_Co.getWndoLyrRef(barObj) } );
        this.addEvent(barObj, 'on_slide', function(x,y) { dw_Scrollbar_Co.updateScrollPosition(barObj, x, y) } );
        this.addEvent(barObj, 'on_drag', function(x,y) { dw_Scrollbar_Co.updateScrollPosition(barObj, x, y) } );
        this.addEvent(barObj, 'on_slide_end', function(x,y) { dw_Scrollbar_Co.updateScrollPosition(barObj, x, y); } );
        this.addEvent(barObj, 'on_drag_end', function(x,y) { dw_Scrollbar_Co.updateScrollPosition(barObj, x, y); } );
    
    },
    
    // Provide means to add functions to be invoked on pseudo events (on_load, on_scroll, etc) 
    // without overwriting any others that may already be set
    // by Mark Wubben (see http://simonwillison.net/2004/May/26/addLoadEvent/)
    addEvent: function(o, ev, fp) {
        var oldEv = o[ev];
        if ( typeof oldEv != 'function' ) {
            //o[ev] = fp;
            // almost all the functions (on_scroll, on_drag, etc.) pass x,y
            o[ev] = function (x,y) { fp(x,y); }
        } else {
            o[ev] = function (x,y) {
                  oldEv(x,y );
                  fp(x,y);
            }
        }
    },

    // Keep position of dragBar in sync with position of layer when scrolled by other means (mouseover, etc.)
    updateScrollbar: function(scrollObj, x, y) { // 
        var nx, ny;
        if ( scrollObj.vBar && scrollObj.maxY ) { 
            var vBar = scrollObj.vBar;
            ny = -( y * ( (vBar.maxY - vBar.minY) / scrollObj.maxY ) - vBar.minY );
            ny = Math.min( Math.max(ny, vBar.minY), vBar.maxY);  
            if (vBar.bar) { // ref to bar el
                nx = parseInt(vBar.bar.style.left);
                vBar.shiftTo(nx, ny);
            }
        }
        if ( scrollObj.hBar && scrollObj.maxX ) {
            var hBar = scrollObj.hBar;
            nx = -( x * ( (hBar.maxX - hBar.minX) / scrollObj.maxX ) - hBar.minX );
            nx = Math.min( Math.max(nx, hBar.minX), hBar.maxX);
            if (hBar.bar) {
                ny = parseInt(hBar.bar.style.top);
                hBar.shiftTo(nx, ny);
            }
        }
    },

    updateScrollPosition: function(barObj, x, y) { // on scrollbar movement
        var nx, ny; var wndo = barObj.wndo; 
        if ( !wndo.lyr ) {
            wndo.lyr = document.getElementById(wndo.lyrId);
        }
        if (barObj.axis == "v") {
            nx = wndo.x; // floating point values for loaded layer's position held in shiftTo method
            ny = -(y - barObj.minY) * ( wndo.maxY / (barObj.maxY - barObj.minY) ) || 0;
        } else {
            ny = wndo.y;
            nx = -(x - barObj.minX) * ( wndo.maxX / (barObj.maxX - barObj.minX) ) || 0;
        }
        wndo.shiftTo(nx, ny);
    },
    
    // Scroll area may have both vertical and horizontal bars 
    getBarRefs: function(scrollObj) { // References to Slidebar instance and dom element 
        if ( scrollObj.vBarId ) {
            scrollObj.vBar = dw_Slidebar.col[scrollObj.vBarId];
            scrollObj.vBar.bar = document.getElementById(scrollObj.vBarId);
        }
        if ( scrollObj.hBarId ) {
            scrollObj.hBar = dw_Slidebar.col[scrollObj.hBarId];
            scrollObj.hBar.bar = document.getElementById(scrollObj.hBarId);
        }
    },
    
    getWndoLyrRef: function(barObj) {
        var wndo = barObj.wndo = dw_scrollObj.col[ barObj.wndoId ];
        if ( wndo && !wndo.lyr ) {
            wndo.lyr = document.getElementById(wndo.lyrId);
        }
    }

}




//  4 `````````````````````




/*************************************************************************
    This code is from Dynamic Web Coding at dyn-web.com
    Copyright 2008 by Sharon Paine 
    See Terms of Use at www.dyn-web.com/business/terms.php
    regarding conditions under which you may use this code.
    This notice must be retained in the code as is!

    unobtrusive event handling for use with dw_scroll.js
    version date: Aug 2008
*************************************************************************/

/////////////////////////////////////////////////////////////////////
// two ways to add style sheet for capable browsers

dw_writeStyleSheet = function(file) {
    document.write('<link rel="stylesheet" href="' + file + '" media="screen" />');
}

function dw_addLinkCSS(file) {
    if ( !document.createElement ) return;
    var el = document.createElement("link");
    el.setAttribute("rel", "stylesheet");
    el.setAttribute("type", "text/css");
    el.setAttribute("media", "screen");
    el.setAttribute("href", file);
    document.getElementsByTagName('head')[0].appendChild(el);
}
/////////////////////////////////////////////////////////////////////

// Example class names: load_wn_lyr1, load_wn_lyr2_t2
dw_scrollObj.prototype.setUpLoadLinks = function(controlsId) {
    var wndoId = this.id; var el = document.getElementById(controlsId); 
    var links = el.getElementsByTagName('a');
    var cls, parts;
    for (var i=0; links[i]; i++) {
        cls = dw_scrollObj.get_DelimitedClass( links[i].className );
        parts = cls.split('_');
        if ( parts[0] == 'load' && parts[1] == wndoId && parts.length > 2 ) {
            // no checks on lyrId, horizId
            var lyrId = parts[2]; var horizId = parts[3]? parts[3]: null;
            dw_Event.add( links[i], 'click', function (wndoId, lyrId, horizId) {
                return function (e) {
                    dw_scrollObj.col[wndoId].load(lyrId, horizId);
                    if (e && e.preventDefault) e.preventDefault();
                    return false;
                }
            }(wndoId, lyrId, horizId) ); // see Crockford js good parts pg 39
        }
    }
}

dw_scrollObj.prototype.setUpScrollControls = function(controlsId, autoHide, axis) {
    var wndoId = this.id; var el = document.getElementById(controlsId); 
    if ( autoHide && axis == 'v' || axis == 'h' ) {
        dw_scrollObj.handleControlVis(controlsId, wndoId, axis);
        dw_Scrollbar_Co.addEvent( this, 'on_load', function() { dw_scrollObj.handleControlVis(controlsId, wndoId, axis); } );
        dw_Scrollbar_Co.addEvent( this, 'on_update', function() { dw_scrollObj.handleControlVis(controlsId, wndoId, axis); } );
    }
    
    var links = el.getElementsByTagName('a'), cls, eType;
    for (var i=0; links[i]; i++) { 
        cls = dw_scrollObj.get_DelimitedClass( links[i].className );
        eType = dw_scrollObj.getEv_FnType( cls.slice(0, cls.indexOf('_') ) );
        switch ( eType ) {
            case 'mouseover' :
            case 'mousedown' :
                dw_scrollObj.handleMouseOverDownLinks(links[i], wndoId, cls);
                break;
            case 'scrollToId': 
                dw_scrollObj.handleScrollToId(links[i], wndoId, cls);
                break;
            case 'scrollTo' :
            case 'scrollBy':
            case 'click': 
                dw_scrollObj.handleClick(links[i], wndoId, cls) ;
                break;
        }
    }
}

dw_scrollObj.handleMouseOverDownLinks = function (linkEl, wndoId, cls) {
    var parts = cls.split('_'); var eType = parts[0];
    var re = /^(mouseover|mousedown)_(up|down|left|right)(_[\d]+)?$/;
                
    if ( re.test(cls) ) { 
        var eAlt = (eType == 'mouseover')? 'mouseout': 'mouseup';
        var dir = parts[1];  var speed = parts[2] || null; 
        var deg = (dir == 'up')? 90: (dir == 'down')? 270: (dir == 'left')? 180: 0;
        
        dw_Event.add(linkEl, eType, function (e) { dw_scrollObj.col[wndoId].initScrollVals(deg, speed); } );
        dw_Event.add(linkEl, eAlt, function (e) { dw_scrollObj.col[wndoId].ceaseScroll(); } );
            
        if ( eType == 'mouseover') {
            dw_Event.add( linkEl, 'mousedown', function (e) { dw_scrollObj.col[wndoId].speed *= 3; } );
            dw_Event.add( linkEl, 'mouseup', function (e) { 
                dw_scrollObj.col[wndoId].speed = dw_scrollObj.prototype.speed; } ); 
        }
        dw_Event.add( linkEl, 'click', function(e) { if (e && e.preventDefault) e.preventDefault(); return false; } );
    }
}

// scrollToId_smile, scrollToId_smile_100, scrollToId_smile_lyr1_100    
dw_scrollObj.handleScrollToId = function (linkEl, wndoId, cls) {
    var parts = cls.split('_'); var id = parts[1], lyrId, dur;
    if ( parts[2] ) {
        if ( isNaN( parseInt(parts[2]) ) ) { 
            lyrId = parts[2];
            dur = ( parts[3] && !isNaN( parseInt(parts[3]) ) )? parseInt(parts[3]): null;
        } else {
            dur = parseInt( parts[2] );
        }
    }
    dw_Event.add( linkEl, 'click', function (e) {
            dw_scrollObj.scrollToId(wndoId, id, lyrId, dur);
            if (e && e.preventDefault) e.preventDefault();
            return false;
        } );
}

// doesn't checks if lyrId in wndo, el in lyrId
dw_scrollObj.scrollToId = function(wndoId, id, lyrId, dur) {
    var wndo = dw_scrollObj.col[wndoId];
    var el = document.getElementById(id);
    if (el) {
        if ( lyrId ) {
            if ( document.getElementById(lyrId) && wndo.lyrId != lyrId ) {
                wndo.load(lyrId);
            }
        }
        var lyr = document.getElementById(wndo.lyrId);
        var x = dw_getLayerOffset(el, lyr, 'left');
        var y = dw_getLayerOffset(el, lyr, 'top');
        wndo.initScrollToVals(x, y, dur);
    }
}

dw_scrollObj.handleClick = function (linkEl, wndoId, cls) {
    var wndo = dw_scrollObj.col[wndoId];
    var parts = cls.split('_'); var eType = parts[0]; 
    var dur_re = /^([\d]+)$/; var fn, re, x, y, dur;
    
    switch (eType) {
        case 'scrollTo' :
            fn = 'scrollTo';  re = /^(null|end|[\d]+)$/;
            x = re.test( parts[1] )? parts[1]: '';
            y = re.test( parts[2] )? parts[2]: '';
            dur = ( parts[3] && dur_re.test(parts[3]) )? parts[3]: null;
            break;
        case 'scrollBy': // scrollBy_m30_m40, scrollBy_null_m100, scrollBy_100_null
            fn = 'scrollBy';  re = /^(([m]?[\d]+)|null)$/;
            x = re.test( parts[1] )? parts[1]: '';
            y = re.test( parts[2] )? parts[2]: '';
            
            // negate numbers (m not - but vice versa) 
            if ( !isNaN( parseInt(x) ) ) {
                x = -parseInt(x);
            } else if ( typeof x == 'string' ) {
                x = x.indexOf('m') !=-1 ? x.replace('m', ''): x;
            }
            if ( !isNaN( parseInt(y) ) ) {
                y = -parseInt(y);
            } else if ( typeof y == 'string' ) {
                y = y.indexOf('m') !=-1 ? y.replace('m', ''): y;
            }
            
            dur = ( parts[3] && dur_re.test(parts[3]) )? parts[3]: null;
            break;
        
        case 'click': 
            var o = dw_scrollObj.getClickParts(cls);
            fn = o.fn; x = o.x; y = o.y; dur = o.dur;
            break;
    }
    if ( x !== '' && y !== '' ) {
        if (x == 'end') { x = wndo.maxX; }
        if (y == 'end') { y = wndo.maxY; }
        if (x === 'null' || x === null) { x = wndo.x; }
        if (y === 'null' || y === null) { y = wndo.y; }
        
        x = parseInt(x); y = parseInt(y);  
        dur = !isNaN( parseInt(dur) )? parseInt(dur): null;
        
        if (fn == 'scrollBy') {
            dw_Event.add( linkEl, 'click', function (e) {
                    dw_scrollObj.col[wndoId].initScrollByVals(x, y, dur);
                    if (e && e.preventDefault) e.preventDefault();
                    return false;
                } );
        } else if (fn == 'scrollTo') {
            dw_Event.add( linkEl, 'click', function (e) {
                    dw_scrollObj.col[wndoId].initScrollToVals(x, y, dur);
                    if (e && e.preventDefault) e.preventDefault();
                    return false;
                } );
        }
    }
}

// get info from className (e.g., click_down_by_100)
dw_scrollObj.getClickParts = function(cls) {
    var parts = cls.split('_');
    var re = /^(up|down|left|right)$/;
    var dir, fn = '', dur, ar, val, x = '', y = '';
    
    if ( parts.length >= 4 ) {
        ar = parts[1].match(re);
        dir = ar? ar[1]: null;
            
        re = /^(to|by)$/; 
        ar = parts[2].match(re);
        if (ar) {
            fn = (ar[0] == 'to')? 'scrollTo': 'scrollBy';
        } 
    
        val = parts[3]; // value on x or y axis
        re = /^([\d]+)$/;
        dur = ( parts[4] && re.test(parts[4]) )? parts[4]: null;
    
        switch (fn) {
            case 'scrollBy' :
                if ( !re.test( val ) ) {
                    x = ''; y = ''; break;
                }
                switch (dir) { // 0 for unspecified axis 
                    case 'up' : x = 0; y = val; break;
                    case 'down' : x = 0; y = -val; break;
                    case 'left' : x = val; y = 0; break;
                    case 'right' : x = -val; y = 0;
                 }
                break;
            case 'scrollTo' :
                re = /^(end|[\d]+)$/;
                if ( !re.test( val ) ) {
                    x = ''; y = ''; break;
                }
                switch (dir) { // null for unspecified axis 
                    case 'up' : x = null; y = val; break;
                    case 'down' : x = null; y = (val == 'end')? val: -val; break;
                    case 'left' : x = val; y = null; break;
                    case 'right' : x = (val == 'end')? val: -val; y = null;
                 } 
                break;
         }
    }
    return { fn: fn, x: x, y: y, dur: dur }
}

dw_scrollObj.getEv_FnType = function(str) {
    var re = /^(mouseover|mousedown|scrollBy|scrollTo|scrollToId|click)$/;
    if (re.test(str) ) {
        return str;
    }
    return '';
}

// return class name with underscores in it 
dw_scrollObj.get_DelimitedClass = function(cls) {
    if ( cls.indexOf('_') == -1 ) {
        return '';
    }
    var whitespace = /\s+/;
    if ( !whitespace.test(cls) ) {
        return cls;
    } else {
        var classes = cls.split(whitespace); 
        for(var i = 0; classes[i]; i++) { 
            if ( classes[i].indexOf('_') != -1 ) {
                return classes[i];
            }
        }
    }
}

dw_scrollObj.handleControlVis = function(controlsId, wndoId, axis) {
    var wndo = dw_scrollObj.col[wndoId];
    var el = document.getElementById(controlsId);
    if ( ( axis == 'v' && wndo.maxY > 0 ) || ( axis == 'h' && wndo.maxX > 0 ) ) {
        el.style.visibility = 'visible';
    } else {
        el.style.visibility = 'hidden';
    }
}




//  5 `````````````````````




function init_dw_Scroll() {
    var wndo = new dw_scrollObj('wn', 'lyr1');
    wndo.setUpScrollbar("dragBar", "track", "v", 1, 1);
    wndo.setUpScrollControls('scrollbar');
}

// if necessary objects exists link in the style sheet and call the init function onload
if ( dw_scrollObj.isSupported() ) {
    dw_writeStyleSheet('../css/text_mac.css')
    dw_Event.add( window, 'load', init_dw_Scroll);
}