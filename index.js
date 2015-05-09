var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var through2 = require('through2');

module.exports = function () {

    return through2.obj( function ( file, enc, cb ) {

        var pattern = /([^\S\r\n]*)#\s+@inline\s+(\S+)[^\S\r\n]*/g;

        var applyIndent = function ( src, indent ) {
            if ( ! indent )
                return src;

            src = indent + src; // indent first line
            src = src.replace( /(\r\n)|\r|\n/g, '\n' + indent );
            return src;
        };

        var resolveInlinePath = function ( src, currentDir ) {
            return src.replace( pattern, function ( match, indent, filename, offset, src ) {
                var includePath = path.resolve( currentDir, filename );
                return indent + '# @inline ' + includePath;
            });
        };

        var inline = function ( src, filepath ) {
            return src.replace( pattern, function ( match, indent, filename, offset, src ) {
                var currentDir = path.dirname( filepath );
                var targetPath = path.resolve( currentDir, filename );
                var targetDir = path.dirname( targetPath );

                if ( ! fs.existsSync( targetPath ) )
                    return cb( new PluginError( 'gulp-coffee-inline', 'Included file not found: ' + targetPath ) );

                var target = fs.readFileSync( targetPath, 'utf-8' );
                target = applyIndent( target, indent );
                target = resolveInlinePath( target, targetDir );
                return target;
            });
        }

        if ( file.isNull() )
            return cb( null, file );

        if ( file.isStream() )
            return cb( new PluginError( 'gulp-coffee-inline', 'Streaming not supported' ) );

        var str = file.contents.toString('utf8');
        while ( pattern.test( str ) )
            str = inline( str, file.path );

        file.contents = new Buffer( str );

        cb( null, file );
    });
};
