define(['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['chat'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  return "<div class=\"col-xs-12 full-height\">\r\n    <div class=\"row header-row\">\r\n        <div class=\"col-xs-10\">\r\n            <ul class=\"nav nav-tabs tabslist\" role=\"tablist\" id=\"tabslist\">\r\n            </ul>\r\n        </div>\r\n        <div class=\"col-xs-2\">\r\n            <div class=\"btn-group\">\r\n                <button class=\"btn btn-danger\" title=\"Join A Room\" data-toggle=\"modal\" data-target=\".add-channel-modal\">\r\n                    <span class=\"glyphicon glyphicon-plus\"></span>\r\n                </button>\r\n            </div>\r\n            <div class=\"modal fade add-channel-modal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"add-room-modal\" aria-hidden=\"true\">\r\n                <div class=\"modal-dialog\">\r\n                    <div class=\"modal-content\">\r\n                        <div class=\"modal-header\">\r\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\r\n                            <h4 class=\"modal-title\">Join/Create a room</h4>\r\n                        </div>\r\n                        <div class=\"modal-body\">\r\n                            <form role=\"form\" id=\"join-form\">\r\n                                <div class=\"form-group\">\r\n                                    <label for=\"join-room\" class=\"control-label\">Room:</label>\r\n                                    <input type=\"text\" class=\"form-control\" id=\"join-room\">\r\n                                </div>\r\n                            </form>\r\n                        </div>\r\n                        <div class=\"modal-footer\">\r\n                            <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\r\n                            <button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" id=\"join-btn\">Join</button>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"tab-content main-row\" id=\"tabs-content\">\r\n    </div>\r\n</div>";
  },"useData":true});
templates['private'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"tab-pane full-height\" id=\"tab-"
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-content\">\r\n    <div class=\"col-xs-12 full-height\">\r\n        <div class=\"row main-chat\">\r\n            <div class=\"col-xs-12\">\r\n                <ul id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-messages\" class=\"list-group messages\">\r\n                </ul>\r\n            </div>\r\n        </div>\r\n        <div class=\"row input-row\">\r\n            <div class=\"col-xs-12\">\r\n                <form action=\"\" id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-send\" class=\"send-form\">\r\n                    <div class=\"form-group well well-sm anchor-bottom\">\r\n                        <div class=\"input-group\">\r\n                            <input id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-message\" autocomplete=\"off\" class=\"form-control sender\" />\r\n                            <span class=\"input-group-btn\"><button class=\"btn btn-danger\">Send</button></span>\r\n                        </div>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});
templates['room'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<div class=\"tab-pane full-height\" id=\"tab-"
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-content\">\r\n    <div class=\"col-xs-12 col-md-10 full-height\">\r\n        <div class=\"row main-chat\">\r\n            <div class=\"col-xs-12\">\r\n                <ul id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-messages\" class=\"list-group messages\">\r\n                </ul>\r\n            </div>\r\n        </div>\r\n        <div class=\"row input-row\">\r\n            <div class=\"col-xs-12\">\r\n                <form action=\"\" id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-send\" class=\"send-form\">\r\n                    <div class=\"form-group well well-sm anchor-bottom\">\r\n                        <div class=\"input-group\">\r\n                            <input id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-message\" autocomplete=\"off\" class=\"form-control sender\" />\r\n                            <span class=\"input-group-btn\"><button class=\"btn btn-danger\">Send</button></span>\r\n                        </div>\r\n                    </div>\r\n                </form>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div class=\"col-md-2 full-height\">\r\n        <div class=\"well full-height\">\r\n            <ul id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-users\" class=\"list-group user-list\">\r\n            </ul>\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true});
templates['tab'] = template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<a href=\"#tab-"
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "-content\" aria-controls=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "\" role=\"tab\" data-toggle=\"tab\">\r\n    "
    + escapeExpression(((helper = (helper = helpers.display || (depth0 != null ? depth0.display : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"display","hash":{},"data":data}) : helper)))
    + " <span class=\"badge\">"
    + escapeExpression(((helper = (helper = helpers.badge || (depth0 != null ? depth0.badge : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"badge","hash":{},"data":data}) : helper)))
    + "</span>\r\n    <span data-id=\""
    + escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"close-tab glyphicon glyphicon-remove\"></span>\r\n</a>";
},"useData":true});
return templates;
});