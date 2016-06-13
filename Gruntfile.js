'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    // Configurable paths
    var paths = {
        tmp: '.tmp',
        assets: './public/map_templates'
    };

    grunt.initConfig({

        // Project settings
        paths: paths,
        config: { version: '1.0.0'},

        // Watches files for changes and runs tasks based on the changed files
        watch: {            
            json: {
                files: ['./src/map_data/*.json'],
                tasks: ['concat:contentjson','copy']
            },
            less: {
                files: ['./src/bootstrap-gisp/less/**/*.less'],
                tasks: ['less', 'usebanner', 'autoprefixer', 'copy']
            }
        },

        // Clean out gen'd folders
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= paths.tmp %>',
                        '<%= paths.assets %>'                       
                    ]
                }]
            },
            delTempFolders: {
                files: [{
                    dot: true,
                    src: [
                        '<%= paths.tmp %>',
                        './dist'                        
                    ]
                }]
            }
        },

        // Lint LESS
        lesslint: {
            src: ['.src/bootstrap-gisp/less/**/*.less'],
            options: {
                csslint: {
                    'box-model': false,
                    'adjoining-classes': false,
                    'qualified-headings': false,
                    'empty-rules': false,
                    'outline-none': false,
                    'unique-headings': false
                }
            }
        },

        // Lint JS
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= paths.assets %>/js/**/*.js'
            ]
        },

        // LESS -> CSS
        less: {
            options: {
                paths: ['bootstrap-gisp/less', 'bower_components'],
                compress: true,
                sourceMap: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: './src/bootstrap-gisp/less',
                    src: ['gisp-theme.less'],
                    dest: './public/css/',
                    ext: '.min.css'
                }]                
            }
        },

        // Add vendor prefixed styles to CSS
        autoprefixer: {
            options: {
                browsers: ['> 4%', 'last 4 versions']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.assets %>/css/',
                    src: '{,*/}*.css',
                    dest: '<%= paths.assets %>/css/'
                }]                
            }
        },

        // Compress images
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: './src/images',
                    src: '{,*/}*.{png,gif,jpeg,jpg}',
                    dest: '<%= paths.assets %>/images'
                }]
            }
        },        

        // Bundle JS/CSS files
        concat: {
            // bootstrap plugins
            pluginsjs: {
                src: [
                    // 'bower_components/bootstrap/js/affix.js',
                    // 'bower_components/bootstrap/js/alert.js',
                    'bower_components/bootstrap/js/dropdown.js',
                    'bower_components/bootstrap/js/tooltip.js',
                    // 'bower_components/bootstrap/js/modal.js',
                    'bower_components/bootstrap/js/transition.js'
                    // 'bower_components/bootstrap/js/button.js',
                    // 'bower_components/bootstrap/js/popover.js',
                    // 'bower_components/bootstrap/js/carousel.js',
                    // 'bower_components/bootstrap/js/scrollspy.js',
                    // 'bower_components/bootstrap/js/collapse.js'
                    // 'bower_components/bootstrap/js/tab.js',
                ],
                dest: '<%= paths.assets %>/js/vendor/bootstrap.min.js'
            }, 
            // content.json
            contentjson: {
                options: {
                  footer: ']',
                  separator: ','
                },
                src: [
                    './src/map_data/mapdata-open.json',
                    './src/map_data/caf-2-accepted-map.json',
                    './src/map_data/bpr-2016-fixed-25mbps-3mbps-providers.json',
                    './src/map_data/bpr-2016-fixed-25mbps-3mbps-technology.json',
                    './src/map_data/bpr-2016-fixed-speed.json',
                    './src/map_data/nbm.json',
                    './src/map_data/100pct-overlap-map.json',
                    './src/map_data/connect2healthfcc.json',
                    './src/map_data/residential-fixed-connections-over-200-kbps.json',
                    './src/map_data/residential-fixed-connections-3-mbps-768-kbps.json',
                    './src/map_data/number-providers-residential-fixed-connections-over-200-kbps.json',
                    './src/map_data/number-providers-residential-fixed-connections-10-1-mbps.json',
                    './src/map_data/terrestrial-mobile-wireless-digital-coverage-july-2015.json',
                    './src/map_data/nationwide-mobile-wireless-coverage-july-2015.json',
                    './src/map_data/nationwide-lte-coverage-july-2015.json',
                    './src/map_data/amr-channel-finder.json',
                    './src/map_data/tribal-mobility-fund-phase-i-eligible-areas.json',
                    './src/map_data/tribal-mobility-fund-phase-i-potentially-eligible-areas.json',
                    './src/map_data/mobility-fund-phase-1-eligible-areas.json',
                    './src/map_data/800-mhz-cellular-a-block-cgsas.json',
                    './src/map_data/broadband-availability-hawaii.json',
                    './src/map_data/broadband-availability-alaska.json',
                    './src/map_data/broadband-availability.json',
                    './src/map_data/fcc-enforcement-actions-against-pirate-radio-location.json',
                    './src/map_data/section-706-mobile-deployment-map.json',
                    './src/map_data/locations-unserved-fixed-broadband.json',
                    './src/map_data/fcc-connect-america-phase-ii-final-eligible-areas-map.json',
                    './src/map_data/total-high-cost-distributions-rate-return-study-areas.json',
                    './src/map_data/total-line-usf-high-cost-distributions-rate-return-study-areas.json',
                    './src/map_data/net-usf-received-voice-line.json',
                    './src/map_data/rural-health-care-pilot-program.json',
                    './src/map_data/acam-ror-sa-map.json',
                    './src/map_data/connect-america-phase-ii-final-eligible-areas-map.json',
                    './src/map_data/connect-america-phase-ii-initial-eligible-areas-map.json',
                    './src/map_data/fcc-connect-america-fund-phase-ii-cam-v40-illustrative-map-funding-threshold-52.json',
                    './src/map_data/fcc-connect-america-fund-phase-ii-cam-v40-illustrative-map-funding-threshold-48.json',
                    './src/map_data/connect-america-fund-caf-phase-i-round-two.json',
                    './src/map_data/connect-america-fund-caf-phase-i.json',
                    './src/map_data/wireline-maximum-advertised-download-speed.json',
                    './src/map_data/regulatory-type-holding-company-level-study-area.json',
                    './src/map_data/connect-compete-home-broadband-coverage-map.json',
                    './src/map_data/800-mhz-cellular-b-block-cgsas.json',
                    './src/map_data/terrestrial-mobile-broadband-network-coverage-number-providers-census-block-level.json',
                    './src/map_data/terrestrial-mobile-wireless-digital-coverage.json',
                    './src/map_data/nationwide-4g-coverage.json',
                    './src/map_data/terrestrial-wireless-coverage-number-providers.json',
                    './src/map_data/mobility-fund-phase-1-potentially-eligible-areas.json',
                    './src/map_data/study-area-boundaries.json',
                    './src/map_data/frequency-coordination-canada.json',
                    './src/map_data/section-706-fixed-broadband-deployment-map.json'
                ],
                dest: './public/content.json'
            }           
        },

        // Add a banner to the top of the generated LESS file.
        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '/* FCC GISP Theme v<%= config.version %> | http://fcc.github.io/design-standards/ */\n\n',
                    linebreak: true
                },
                files: {
                    src: ['<%= paths.assets %>/css/gisp-theme.min.css'],
                }
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                
                 { // fonts 
                    dot: true,
                    expand: true,
                    cwd: 'bower_components/font-awesome/fonts',
                    src: '**',
                    dest: '<%= paths.assets %>/fonts'
                }]
            }
                       
        }
    });

    grunt.registerTask('build', [
       // 'clean:dist',
        // 'jshint',
        'less',
        // 'imagemin',
        'usebanner',
        'concat',
        'autoprefixer',
        //'copy',
        //'clean:delTempFolders'
    ]);

    grunt.registerTask('default', [
        'build'
    ]);
};
