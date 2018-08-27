//var syntax        = 'sass'; // Syntax: sass or scss;

var gulp          = require('gulp'), // Подключаем Gulp
		gutil         = require('gulp-util' ),
		sass          = require('gulp-sass'), //Подключаем Sass пакет,
		browserSync   = require('browser-sync'), // Подключаем Browser Sync
		concat        = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
		uglify        = require('gulp-uglify'), // Подключаем gulp-uglifyjs (для сжатия JS)
		cleancss      = require('gulp-clean-css'), // Подключаем пакет для минификации CSS
		rename        = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    	del           = require('del'); // Подключаем библиотеку для удаления файлов и папок
		autoprefixer  = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
		notify        = require("gulp-notify"),
		rsync         = require('gulp-rsync');


gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('sass', function() { // Создаем таск Sass
	return gulp.src('app/sass/**/*.sass') // Берем источник
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError())) // Преобразуем Sass в CSS посредством gulp-sass
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))// Создаем префиксы
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
	.pipe(browserSync.stream()) // Обновляем CSS на странице при изменении
});

gulp.task('js', function() {
	return gulp.src([
        'app/libs/jquery/dist/jquery.min.js',
        'app/libs/bootstrap.min.js',
        'app/libs/isotope-layout/isotope.pkgd.min.js',
        'app/js/common.js', // Always at the end
		])
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Mifify js (opt.)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('build', ['removedist', 'sass', 'js'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'app/css/main.min.css',
    ]).pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/scripts.min.js') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'));

    var buildImg = gulp.src('app/img/**/*') // Переносим картинки в продакшен
        .pipe(gulp.dest('dist/img'));

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));

});
gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clear', function () {return cache.clearAll();})

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload)
});


gulp.task('default', ['watch']);
