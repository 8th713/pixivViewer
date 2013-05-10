angular.module('app.services')
.factory('Model', ['config', 'extract', 'bookmark', 'favorite', 'rate', 'comments',
function (config, extract, bookmark, favorite, rate, comments) {
  var MATCH_PATTERN = /^.+\/(\d+)(?:.+)?\.(?:jpe?g|png|gif)/,
      models = [];

  function create(el) {
    var model = _.findWhere(models, {id: el.src});

    if (model) {
      model.page = 0;
      return model;
    }

    model = new Model(el);
    models.push(model);
    return model;
  }

  function Model(el) {
    var src = el.src,
        res = MATCH_PATTERN.exec(decodeURI(src));

    this.id = src;
    this.el = el;
    this.page = 0;
    this.illustId = res && res[1];
  }

  _.extend(Model.prototype, {
    setPath: function () {
      var res = this.imgUrl;

      if (this.length > 1) {
        res += '_p' + this.page;
      }
      res += this.imgExt;
      this.path = res || '';
    },
    fetch: function () {
      extract(this.illustId).then(function (res) {
        _.extend(this, res);

        if (!this.imgUrl) {
          return;
        }

        this.setPath();

        if (config.commentEnabled) {
          this.getComments();
        }
      }.bind(this));
    },
    bookmark: function (form) {
      if (this.myPage) {
        return;
      }
      bookmark.add(form).then(function () {
        this.bookmarkState = true;
      }.bind(this));
    },
    addFavorite: function (restrict) {
      if (this.myPage) {
        return;
      }
      favorite.add(restrict, this).success(function () {
        this.favoriteState = true;
      }.bind(this));
    },
    modFavorite: function (restrict) {
      if (this.myPage) {
        return;
      }
      favorite.modify(restrict, this).success(function () {
        this.favoriteState = true;
      }.bind(this));
    },
    removeFavorite: function () {
      if (this.myPage) {
        return;
      }
      favorite.remove(this).success(function () {
        this.favoriteState = false;
      }.bind(this));
    },
    rate: function (score) {
      if (this.myPage || this.score) {
        return;
      }
      rate.set(score, this).success(function () {
        this.rtc += 1;
        this.rtt += score;
        this.score = score;
      }.bind(this));
    },
    getComments: function () {
      comments.get(this).success(function (response) {
        var res = response.data.html_array;

        if (!res.length) {
          res.push('<li>Comments can not find.</li>');
        }
        this.comments = res;
      }.bind(this));
    }
  });

  return {
    create: create
  };
}]);
