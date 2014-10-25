angular.module('columbyApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/routes/about/about.html',
    "<div class=col-md-12>This is the about view.</div>"
  );


  $templateCache.put('app/routes/home/home.html',
    "<div class=sitenav ng-include=\"'components/sitenav/sitenav.html'\"></div><section class=\"page page-home\"><div class=page-header><div class=container><img src=/assets/images/logo-transparant-white.png><h2 class=page-subtitle>publish and discover data</h2></div></div><div class=page-content><div class=container><div class=searchbox><input ng-model=search.searchTerm placeholder=\"Search datasets\" class=input-large ng-change=search()></div><!-- Search result --><div class=\"col-md-12 results recent-publications\"><h3 ng-show=search.hits.length>Search results<div class=\"result publication-listing\" ng-cloak><ul><li ng-repeat=\"result in search.hits\" class=publication-item><h4><a ui-sref=\"dataset.view({datasetId: result._id})\">{{result._source.title}}</a><em>{{result._source.publishStatus}}</em></h4><div class=user-date><!-- {{result._source.account.name || '[Oops! No publisher found]'}} on  --><time class=post-date>{{result._source.createdAt | date:'d MMMM yyyy'}}</time></div></li></ul></div></h3></div><div class=\"recent-publications col-md-12\" ng-hide=search.hits.length><h3>Recently published<div class=publication-listing><ul><li ng-repeat=\"dataset in datasets\" class=publication-item><h4><a ui-sref=\"dataset.view({ datasetId: dataset._id })\" ng-bind-html=\"dataset.title || 'Untitled'\"></a><!-- <br/>[{{dataset._id}}] --><span ng-show=\"\"><em>{{dataset.publishStatus}}</em></span></h4><div class=user-date><a ui-sref=account.view({slug:dataset.account.slug})>{{dataset.account.name || '[Oops! No publisher found]'}}</a> on <time class=post-date>{{dataset.createdAt | date:'MMMM d, yyyy'}}</time></div></li></ul></div></h3></div></div></div></section>"
  );


  $templateCache.put('app/routes/search/search.html',
    "<div class=col-md-12>This is the search view.</div>"
  );


  $templateCache.put('components/metabar/metabar.html',
    "<nav class=metabar data-ng-controller=MetabarCtrl><div class=metabar-content><button type=button class=\"btn btn-default menu-btn\" ng-show=showToggle ng-click=toggleSiteNav()>menu</button></div></nav>"
  );


  $templateCache.put('components/modal/modal.html',
    "<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat=\"button in modal.buttons\" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>"
  );


  $templateCache.put('components/navbar/navbar.html',
    "<div class=\"navbar navbar-default navbar-static-top\" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click=\"isCollapsed = !isCollapsed\"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href=\"/\" class=navbar-brand>columby</a></div><div collapse=isCollapsed class=\"navbar-collapse collapse\" id=navbar-main><ul class=\"nav navbar-nav\"><li ng-repeat=\"item in menu\" ng-class=\"{active: isActive(item.link)}\"><a ng-href={{item.link}}>{{item.title}}</a></li></ul></div></div></div>"
  );


  $templateCache.put('components/sitenav/sitenav.html',
    "<nav class=sitenav-wrapper ng-controller=SiteNavCtrl ng-class=\"{active: showSitenav}\"><div class=sitenav-content><button type=button class=close ng-click=toggleSiteNav()><span aria-hidden=true>&times;</span><span class=sr-only>Close</span></button><ul><li><a ui-sref=home><i class=\"fa fa-home\"></i> Home</a> <a ui-sref=search class=search><i class=\"fa fa-search\"></i></a></li><li ng-show=$root.user.isAuthenticated><a ui-sref=dataset.create ng-class=\"{active: $state.includes('dataset.create')}\">Publish new dataset</a></li><!-- <li ng-show=\"$root.user.isAuthenticated\">\n" +
    "        <a ui-sref='account.view({slug: $root.selectedAccount.slug})'>My datasets</a>\n" +
    "      </li> --><li ng-show=$root.user.isAuthenticated><a ui-sref=\"account.view({slug: $root.user.accounts[ $root.user.selectedAccount].slug})\" ng-class=\"{active: $state.includes(account.view)}\">My profile<!-- {{$root.selectedAccount.name}} --></a> <span class=settings><a ui-sref=settings><i class=\"fa fa-cog\"></i></a></span></li><!-- Account switcher --><li ng-show=\"$root.user.isAuthenticated && $root.user.accounts.length > 1\"><div account-switcher accounts=$root.user.accounts></div></li><li ng-hide=$root.user.isAuthenticated><a ui-sref=signin class=highlight>Login or Signup</a></li></ul><div uservoice></div><div class=stat-nav><ul><li><a ui-sref=about>About Columby</a></li><li><a ui-sref=features>Features &amp; Pricing</a></li><li><a ui-sref=roadmap>Roadmap</a></li><li><a href=//docs.columby.com target=_blank>Docs</a></li><li><a href=//columby.uservoice.com target=_blank>Support</a></li><!-- <li><a ui-sref=\"terms\">Terms</a></li> --></ul><a ui-sref=home><div class=logo><img src=/assets/images/logo-transparant-white.png></div></a></div></div></nav>"
  );

}]);
