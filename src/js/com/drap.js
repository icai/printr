$(function() {
    var moveObj = undefined,
        startX, startY, endX, endY, orignX, orignY;

    $(".zoomElement").each(function() {
        $(this).mousemove(function(e) {
            var target = e.target;

            var offsetX = e.offsetX;
            var offsetY = e.offsetY;

            var direction = inZoomArea(offsetX, offsetY, target);
        });

        $(this).mousedown(function(e) {
            var target = e.target;

            var offsetX = e.offsetX;
            var offsetY = e.offsetY;

            var direction = inZoomArea(offsetX, offsetY, target);

            handleZoomByDirection(direction, target);
        });
    })

    window.onmousedown = function(e) {
        e.preventDefault();
        if (e.target.className.indexOf("moveElement") != -1 && inZoomArea(e.offsetX, e.offsetY, e.target) == "no") {
            moveObj = e.target;

            var parent = $(moveObj).parents(".moveAndZoom");

            orignX = e.offsetX;
            orignY = e.offsetY;

            startX = getOffsetParentValue("offsetLeft", parent);
            startY = getOffsetParentValue("offsetTop", parent);
            endX = parent[0].offsetWidth - moveObj.offsetWidth;
            endY = parent[0].offsetHeight - moveObj.offsetHeight;

            moveObj.style.cursor = "move";
        }
    }

    window.onmousemove = function(e) {
        e.preventDefault(); //阻止默认事件
        if (moveObj != undefined && moveObj.className.indexOf("moveElement") != -1) {
            var target = moveObj;

            var left = e.pageX - startX - orignX;
            var top = e.pageY - startY - orignY;

            if (left <= 0) left = 0;
            if (top <= 0) top = 0;
            if (left >= endX) left = endX;
            if (top >= endY) top = endY;

            moveObj.style.left = left + "px";
            moveObj.style.top = top + "px";

            moveObj.style.cursor = "move";
        }
    }

    window.onmouseup = function(e) {
        e.preventDefault();
        if (moveObj != undefined && moveObj.className.indexOf("moveElement") != -1) {
            var target = moveObj;

            var left = e.pageX - startX - orignX;
            var top = e.pageY - startY - orignY;
            if (left <= 0) left = 0;
            if (top <= 0) top = 0;
            if (left >= endX) left = endX;
            if (top >= endY) top = endY;

            moveObj.style.left = left + "px";
            moveObj.style.top = top + "px";

            moveObj.style.cursor = "auto";

            moveObj = undefined;
        }
    }
});

/*
 return element is in zoom area or not
*/
function inZoomArea(offsetX, offsetY, target) {
    var width = target.offsetWidth;
    var height = target.offsetHeight;

    //只处理右下角一种情况
    if (offsetX >= width - 5 && offsetY >= height - 5) {
        target.style.cursor = "nw-resize";
        return "nw";
    }else{
    	target.style.cursor = "auto";
    	return "no";
    }

    return;

    if (offsetX < 5 && offsetY < 5 || offsetX >= width - 5 && offsetY >= height - 5) {
        target.style.cursor = "nw-resize";
        return "nw";
    } else if (offsetX < 5 && offsetY >= height - 5 || offsetX >= width - 5 && offsetY < 5) {
        target.style.cursor = "sw-resize";
        return "sw";
    } else if (offsetX < 5 || offsetX >= width - 5) {
        target.style.cursor = "w-resize";
        return "w";
    } else if (offsetY < 5 || offsetY >= height - 5) {
        target.style.cursor = "n-resize";
        return "n";
    } else {
        target.style.cursor = "auto";
        return "no";
    }
}

function handleZoomByDirection(direction, target) {
    switch (direction) {
        //左上和右下
        case "nw":
            //左下和右上
        case "sw":
            (function() {
                var parent = $(target).parents(".moveAndZoom");

                var orignX = target.offsetLeft;
                var orignY = target.offsetTop;
                var orignWidth = target.offsetWidth;
                var orignHeight = target.offsetHeight;

                parent.mousedown(function(e) {
                    e.preventDefault();
                    startX = getOffsetParentValue("offsetLeft", parent, $("body"));
                    startY = getOffsetParentValue("offsetTop", parent, $("body"));
                    endX = parent[0].offsetWidth;
                    endY = parent[0].offsetHeight;
                });

                parent.mousemove(function(e) {
                    e.preventDefault();

                    var newWidth = e.pageX - startX - orignX;
                    var newHeight = e.pageY - startY - orignY;

                    target.style.opacity = 0.5;
                    target.style.width = newWidth + "px";
                    target.style.height = newHeight + "px";

                });

                parent.mouseup(function(e) {
                    e.preventDefault();

                    parent.unbind("mousedown");
                    parent.unbind("mousemove");
                    parent.unbind("mouseup");

                    target.style.opacity = 1;
                });



            })();
            break;
        case "w":
            break;
        case "n":
            break;
        default:
            break;
    }
}

/*
startElement and endElement are jquery object

direction value = offsetLeft or offsetTop
*/
function getOffsetParentValue(direction, startElement) {
    if (startElement[0] === document.body) {
        return 0;
    } else {
        return getOffsetParentValue(direction, $(startElement[0].offsetParent), endElement) + startElement[0][direction];
    }
}
