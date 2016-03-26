$(document).ready( function($) {

    //// Get and display one, specific issue ////
    var issueId = $('div.issue').attr('id');

    $.ajax({
        type: 'GET',
        url: 'https://api.github.com/repos/npm/npm/issues/' + issueId,
        data: { key: 'value' },
        dataType: 'json',

        success: function( output ) {
            // Append specific issue's data
            $('div.issue').append(
                '<h2 class="issueStateTitle">' + output.title + ' ~ ' +
                    output.state + ' State</h2>' +

                retrieveLabels( output ) +

                '<img src="' + output.user.avatar_url + '" alt="' +
                    output.user.login + '\'s Avatar" />' +

                '<h3 class="user"><a href="' + output.user.html_url + '" ' +
                    'target="_blank">@' + output.user.login + '</a></h3>' +

                '<div class="issueBody">' + formatBodyText( output, 0, false ) + '</div>'
            );

            retrieveComments( output )
        },

        error: function( error ) {
            console.log( 'Error: ' + error );
        }
    });


    /**
     * Retrieve and display labels for each issue
     * @param output      JSON data
     * @returns {string}  HTML string
     */
    function retrieveLabels( output ) {
        var string = '<div class="issueLabels">';

        // If the issue has labels
        if( output.labels.length > 0 ) {

            // Return each label with its attributes
            $.each( output.labels, function(i) {
                string += '<span class="issueLabel" style="color: \#' +
                    output.labels[i].color + '">#' + output.labels[i].name +
                    '</span>';
            });
        }

        string += '</div>';

        return string;
    }


    /**
     * Preserves formatting of body text
     * @param output      JSON data
     * @param key         Issue iterator
     * @param hasKey      Iterating through multiple?
     * @returns {string}  HTML string
     */
    function formatBodyText( output, key, hasKey ) {
        // Start text and html string
        var text;
        var html = '<p>';

        // For comments on issue
        if( hasKey ) {
            text = output[key].body;
        }

        // For issue
        else {
            text = output.body;
        }


        // If text is null
        if( text == null ) {
            html += '</p>';
        }

        else {
            //// Preserve formatting of text
            var prevI = 0;   // Previous position in text

            for( var i = 0; i < text.length; i++ ) {
                var remainingLength = text.length - i;


                // One line break ('\r\n')
                if( text[i] == '\r' && text[i+1] == '\n' &&
                    text[i+2] != '\r' && text[i+3] != '\n' ) {

                    html += text.substring( prevI, i ) + '</p><p>';
                    i++;   // Skip over '\n' character
                }


                // Two line breaks ('\r\n\r\n')
                else if( text[i] == '\r' && text[i+1] == '\n' &&
                    text[i+2] == '\r' && text[i+3] == '\n' ) {

                    html += text.substring( prevI, i ) + '</p><br/><p>';
                    i += 3;   // Skip over '\n\r\n' characters
                }


                // User names ('@username')
                else if( text[i] == '@' && (text[i-1] == ' ' || text[i-1] == undefined ||
                         text[i-1] == '`' || text[i-1] == '"') ) {
                    var username = "";

                    // Get entire username with @ character
                    for( var j = 0; j < remainingLength; j++ ) {
                        // Add space after username
                        if( text[i] == ' ' ) {
                            username += ' ';
                            i--;
                            break;
                        }

                        // Don't add space after username
                        else if( text[i] == ',' || text[i] == '.' || text[i] == '"' ||
                                 text[i] == '?' || text[i] == '!' || text[i] == '`' ||
                                 text[i] == '[' || text[i] == ':' ) {
                            i--;
                            break;
                        }

                        username += text[i];
                        i++;   // Update i
                    }

                    html += "<a href='https://github.com/" + username.substring(1) +
                        "' target='_blank'>" + username + '</a>';
                }


                // Links ('http(s)://...')
                else if( text.substring(i, i+8) == 'https://' ||
                         text.substring(i, i+7) == 'http://' ) {
                    var link = "";

                    // Get entire link
                    for( var k = 0; k < remainingLength; k++ ) {
                        // Exclude following characters
                        if( text[i] == ' ' || text[i] == ')' || text[i] == '>' ||
                            text[i] == '\r' || text[i] == ']' || text[i] == '@' ||
                            text[i] == '`' || text[i] == "'" || text[i] == '"' ||
                            text[i] == '!' || text.substring(i, i+3) == '...' ) {
                            i--;
                            break;
                        }

                        // Exclude ending period
                        else if( text[i] == '.' && (text[i+1] == ' ' || text[i+1] == undefined) ) {
                            i--;
                            break;
                        }

                        link += text[i];
                        i++;   // Update i
                    }

                    html += "<a href='" + link + "' target='_blank'>" + link + '</a>';
                }


                // Start of HTML tags
                else if( text[i] == '<' ) {
                    html += '&lt;';
                }

                // End of HTML tags
                else if( text[i] == '>' ) {
                    html += '&gt;';
                }

                // Every other character
                else {
                    html += text[i];
                }

                // Update previous position
                prevI = i + 1;
            }

            // End html string
            html += '</p>';
        }

        return html;
    }


    /**
     * Retrieve and display comments for an issue
     * @param output      JSON data
     * @returns {string}  HTML string
     */
    function retrieveComments( output ) {
        // If issue has comments
        if( output.comments > 0 ) {

            // Retrieve each comment and its data
            $.ajax({
                type: 'GET',
                url: 'https://api.github.com/repos/npm/npm/issues/' + issueId + '/comments',
                data: { key: 'value' },
                dataType: 'json',

                success: function( output ) {
                    $.each( output, function(key) {

                        // Append each comment's data
                        $('div#comments').append(
                            '<div class="comment">' +
                                '<img src="' + output[key].user.avatar_url + '" alt="' +
                                    output[key].user.login + '\'s Avatar" />' +

                                '<h3 class="user"><a href="' + output[key].user.html_url + '" ' +
                                    'target="_blank">@' + output[key].user.login + '</a></h3>' +

                                '<div class="issueBody">' + formatBodyText( output, key, true ) +
                                '</div>' +
                            '</div>'
                        );
                    });
                },

                error: function( error ) {
                    console.log( 'Error: ' + error );
                }
            });
        }
    }

});
