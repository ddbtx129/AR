/**
 * v0.3.0
 * KKsMagic 雪のプリセット
 * ランダムダンス効果には、SimplexNoiseとpolyfill / typedarrayが必要です
 */

(function () {
    // プリセットが配置されているパスを取得します
    var js = document.scripts;
    js = js[js.length - 1];
    var path = js.src.substring(0, js.src.lastIndexOf("/") + 1);

    // プリセットの登録
    particlemagic.addPreset('snow', {
        init: init,
        tick: tick,
        author: 'zhyuzh',
        desc: 'A 400X400X400 snow box,not textured,with options.color,as default preset.',
    });

    var particlemagicOpt = {
        maxCount: 2000,                         // 雪片の最大数、この数を超える雪片は無視されます
        count: 20,                              // 1秒あたりに発生する雪片の数、推奨60~100
        size: 1,                                // スノーフレークサイズ、変更はお勧めしません
        pos: '0 -30 0',                         // 降る雪の範囲の中心。変更することはお勧めしません。雪片はy値より下に消えます。
        box: '100 10 100',                      // posと比較して、雪片を生成するボックスは、範囲が広いほど、より多くの雪片を生成する必要があります。
        boxHeight: 90,                          // 地面からのスノーフレークボックスの高さ
        speed: 10,                              // 毎秒値を下げてください。5~20をお勧めします
        acc: 5,                                 // 1秒あたりの変化量である加速度は、生成時に有効になります。速度よりも小さいことをお勧めします。この値は、ダンス効果にもわずかに影響します。
        accRand: 2,                             // 加速ランダム変化値。生成時に有効です。accの合計は速度よりも小さいことをお勧めします
        dance: 7,                               // 1秒あたりのドリフト振幅は、値が大きいほど水平ドリフトが深刻になり、すぐに有効になります。2~10をお勧めします
        color: '#FFFFFF',                       // スノーフレークの色、変更はお勧めしません
        colors: undefined,                      // ランダムな色、配列は、色オプションを上書きします。非推奨
        opacity: 0.66,                          // 雪の透明度、推奨0.1~1
        textrue: path + "/imgs/dot-64.png",     // スノーフレークの形の写真。変更 非推奨
    };

    /**
     * デフォルトの初期化パーティクル関数、
     * 400立方メートルの範囲でランダムに粒子を生成します
     * デフォルトの画像素材を読む
     * @returns {object} THREE.Points
     */
    function init() {
        var ctx = this;

        // 基本データを生成する
        ctx.$particlemagicData = {
            time: 0,
            points: [],
            colors: [],
        };

        genOpt.call(ctx);

        // Object3Dオブジェクトを生成する
        ctx.$particlemagicSnow = new THREE.Points(new THREE.Geometry(), ctx.$particlemagicData.mat);
        var particlemagic = new THREE.Group();
        particlemagic.add(ctx.$particlemagicSnow);

        // 更新リスナーを追加します
        ctx.el.addEventListener('particlemagicUpdate', function (evt) {
            ctx.data.options = evt.detail || {};
            genOpt.call(ctx);
            ctx.$particlemagicSnow.material = ctx.$particlemagicData.mat;
        });

        return particlemagic;
    };


    /**
     * 各ティックのデフォルト機能は、自動的に下がり、一番下に下がり、一番上に戻ります
     */
    function tick() {
        var ctx = this;
        var time = arguments[0][0];
        var deltaTime = arguments[0][1];

        genSnow.call(ctx, deltaTime);
        tickSnow.call(ctx, deltaTime);
    };


    //---------------functions--------------

    /**
     * 動的に生成された設定オプション
     */
    function genOpt() {
        var ctx = this;
        ctx.$particlemagicOpt = particlemagicOpt;

        // ユーザー設定を統合し、データを整理し、数を制限します
        ctx.$particlemagicOpt = Object.assign(ctx.$particlemagicOpt, ctx.data.options);

        // データを並べ替える
        if (ctx.$particlemagicOpt.pos.constructor == String) {
            var posArr = ctx.$particlemagicOpt.pos.split(' ');
            ctx.$particlemagicOpt.pos = new THREE.Vector3(Number(posArr[0]), Number(posArr[1]), Number(posArr[2]));
        };

        // データを並べ替える
        if (ctx.$particlemagicOpt.box.constructor == String) {
            var boxArr = ctx.$particlemagicOpt.box.split(' ');
            ctx.$particlemagicOpt.box = new THREE.Vector3(Number(boxArr[0]), Number(boxArr[1]), Number(boxArr[2]));
        };

        // 資料を生成する
        var mat = new THREE.PointsMaterial({
            size: ctx.$particlemagicOpt.size,
            map: new THREE.TextureLoader().load(ctx.$particlemagicOpt.textrue),
            blending: THREE.AdditiveBlending,
            opacity: ctx.$particlemagicOpt.opacity,
            transparent: true,
            depthTest: false,
        });

        // ランダムな色の処理
        if (ctx.$particlemagicOpt.colors) {
            var carr = [];
            ctx.$particlemagicOpt.colors.forEach(function (clr) {
                carr.push(new THREE.Color(clr));
            });
            ctx.$particlemagicOpt.colors = carr;
            mat.vertexColors = THREE.VertexColors;
        } else {
            mat.color = new THREE.Color(ctx.$particlemagicOpt.color);
        };

        ctx.$particlemagicData.mat = mat;
    };


    /**
     * スノーフレークを生成し、ポイントキューに新しいスノーフレークポイントを追加します
     */
    function genSnow(deltaTime) {
        var ctx = this;
        var particlemagicData = ctx.$particlemagicData;
        var particlemagicOpt = ctx.$particlemagicOpt;

        var timeUnit = particlemagicData.time == 0 ? 0.16 : deltaTime / 1000;
        var n = timeUnit * particlemagicOpt.count;

        for (var i = 0; i < n; i++) {
            var p = {};

            var x = particlemagicOpt.pos.x + Math.random() * particlemagicOpt.box.x - particlemagicOpt.box.x / 2;
            var y = particlemagicOpt.pos.y + particlemagicOpt.boxHeight + Math.random() * particlemagicOpt.box.y - particlemagicOpt.box.y / 2;
            var z = particlemagicOpt.pos.z + Math.random() * particlemagicOpt.box.z - particlemagicOpt.box.z / 2;
            p.pos = new THREE.Vector3(x, y, z);

            p.acc = genRandomV3().multiplyScalar((particlemagicOpt.acc + Math.random() * particlemagicOpt.accRand));

            // 動的調整でclrが見つからないようにするには、色がオンになっているかどうかに関係なく、clrパラメーターを指定します。
            if (particlemagicOpt.colors) {
                var clr = particlemagicOpt.colors[Math.floor(Math.random() * particlemagicOpt.colors.length)];
                p.clr = clr;
                particlemagicData.colors.push(clr);
            } else {
                p.clr = particlemagicData.mat.color;
            };

            particlemagicData.points.push(p);
        };
    };

    /**
     * フレームごとに雪片の位置を再計算して、新しいオブジェクトを生成します
     */
    var danceGen = SimplexNoise ? new SimplexNoise() : undefined;

    function tickSnow(deltaTime) {
        var ctx = this;
        var particlemagicData = ctx.$particlemagicData;
        var particlemagicOpt = ctx.$particlemagicOpt;

        particlemagicData.time += deltaTime;
        var timeUnit = particlemagicData.time == 0 ? 0.16 : deltaTime / 1000;

        var parr = [];
        var varr = [];
        var carr = [];

        // 最新の雪片を使用し、制限を超えるものは無視してください
        var offset = particlemagicData.points.length < ctx.$particlemagicOpt.maxCount ? 0 : particlemagicData.points.length - ctx.$particlemagicOpt.maxCount;

        for (var i = offset; i < particlemagicData.points.length; i++) {
            var p = particlemagicData.points[i];
            if (p && p.pos && p.pos.y >= particlemagicOpt.pos.y) {

                if (danceGen) {
                    var ax = danceGen.noise2D(p.pos.y * 0.05, p.acc.x);
                    var az = danceGen.noise2D(p.pos.y * 0.05, p.acc.z);
                    var ay = danceGen.noise2D(p.pos.y * 0.05, p.acc.y);
                    var dance = new THREE.Vector3(ax, ay, az);
                    dance.multiplyScalar(particlemagicOpt.dance * timeUnit);
                    p.pos.add(dance);
                };

                p.pos.add(p.acc.clone().multiplyScalar(timeUnit));
                p.pos.setY(p.pos.y -= particlemagicOpt.speed * timeUnit);

                parr.push(p);
                varr.push(p.pos);
                if (particlemagicOpt.colors) carr.push(p.clr);
            };
        };
        particlemagicData.points = parr;

        // パーティクルオブジェクトを更新します
        var newGeo = new THREE.Geometry();
        newGeo.vertices = varr;
        if (particlemagicOpt.colors || particlemagicOpt.colors) newGeo.colors = carr;

        ctx.$particlemagicSnow.geometry = newGeo;
    };


    //--------------ext function-------
    /**
     * -1から+1の正と負の値の乱数を生成します
     * @returns {number} res
     */
    function genRandom() {
        if (Math.random() > 0.5) {
            return Math.random();
        } else {
            return Math.random() * -1;
        };
    };

    /**
     * ランダムなVector3、正と負の値、-1から1を生成します
     * @returns {number} res
     */
    function genRandomV3(base) {
        return new THREE.Vector3(genRandom(), genRandom(), genRandom());
    };

})();
