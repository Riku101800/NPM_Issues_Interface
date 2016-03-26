$(document).ready( function($) {

    //// Get and display each issue ////
    var getIssues = function( page ) {
        $.ajax( {
            type: 'GET',
            url: 'https://api.github.com/repos/npm/npm/issues',
            data: { page: page, per_page: 25 },
            dataType: 'json',

            success: function( output ) {
                // Delete all current issues
                $('div#issues').empty();

                $.each( output, function(key) {
                    // Append each new issue and its data
                    $('div#issues').append(
                        '<div class="issue" id="' + output[key].number + '">' +
                            '<h2 class="issueNumberTitle">Issue ' + output[key].number +
                            ' ~ ' + output[key].title + '</h2>' +

                            displayLabels( output, key ) +

                            '<img src="' + output[key].user.avatar_url + '" alt="' +
                            output[key].user.login + '\'s Avatar" />' +

                            '<h3 class="user"><a href="' + output[key].user.html_url + '" ' +
                            'target="_blank">@' + output[key].user.login + '</a></h3>' +

                            formatBodyText( output, key ) +
                            '<div class="rightAlign"><button>View Full Issue</button></div>' +
                        '</div>'
                    );
                });

                // 'View Full Issue' button functionality
                $('div.issue div.rightAlign button').click( function() {
                    // Get ID of issue clicked
                    var issueId = $(this).parent().parent().attr('id');

                    // Re-direct to specific issue page
                    window.location.href = window.location.origin +
                        '/~sanocki1/vine/issue?i=' + issueId;
                });
            },

            error: function( error ) {
                console.log( 'Error: ' + error );
            }
        });
    };


    //// Pagination functionality ////
    $('div.pageButtons').twbsPagination({
        totalPages: 77,
        visiblePages: 7,

        onPageClick: function( event, page ) {
            // Load clicked page's issues
            getIssues( page );
        }
    });


    //// Arrow Icon Functionality ////
    var arrowIcon = $('img#backToTop');

    // Scroll back to top, on click //
    arrowIcon.click( function() {
        $("html, body").animate({
            scrollTop: 0
        }, 1000);
    });

    // Follow user, on scroll //
    $(window).scroll( function() {

        if( $(window).scrollTop() > 100 && $(window).width() > 1281 ) {
            arrowIcon.show();
            arrowIcon.animate({
                top: $(window).height() / 2.5
            });
        }

        else {
            arrowIcon.hide();
        }
    });


    /**
     * Display labels for each issue
     * @param output      JSON data
     * @param key         Issue iterator
     * @returns {string}  HTML string
     */
    function displayLabels( output, key ) {
        var html = '<div class="issueLabels">';

        // If the issues have labels
        if( output[key].labels.length > 0 ) {

            // Return each label with its attributes
            $.each( output[key].labels, function(i) {
                html += '<span class="issueLabel" style="color: \#' +
                    output[key].labels[i].color + '">#' + output[key].labels[i].name +
                    '</span>';
            });
        }

        html += '</div>';

        return html;
    }


    /**
     * Preserves formatting of body text and truncates it to around 140 characters
     * @param output      JSON data
     * @param key         Issue iterator
     * @returns {string}  HTML string
     */
    function formatBodyText( output, key ) {
        // Get text and start html string
        var text = output[key].body;
        var html = '<div class="issueBody"><p>';

        // If text is null
        if( text == null ) {
            html += '</p>';
        }

        //// Determine text length and truncate, if needed
        else {
            // If text is 140 characters or fewer, display normally
            if( text.length <= 140 ) {
                text = text.substr( 0, text.length );
            }

            // If text is more than 140 characters, truncate
            else {
                for( var j = 140; j <= text.length; j++ ) {
                    // Break text on a space, period, or comma
                    if( text[j] == ' ' || text[j] == '.' || text[j] == ',' ) {
                        text = text.substr( 0, j ) + '...';
                        break;
                    }
                }
            }

            //// Preserve formatting of text
            var prevI = 0;   // Previous position in text

            for( var i = 0; i < text.length; i++ ) {
                var remainingLength = text.length - i;


                // One line break ('\r\n')
                if( text[i] == '\r' && text[i+1] == '\n' &&
                    text[i+2] != '\r' && text[i+3] != '\n' ) {

                    html += text.substring( prevI, i ) + '</p><p>';
                    i ++;   // Skip over '\n'
                }


                // Two line breaks ('\r\n\r\n')
                else if( text[i] == '\r' && text[i+1] == '\n' &&
                    text[i+2] == '\r' && text[i+3] == '\n' ) {

                    html += text.substring( prevI, i ) + '</p><br/><p>';
                    i += 3;   // Skip over '\n\r\n'
                }


                // User names ('@username')
                else if( text[i] == '@' && (text[i-1] == ' ' || text[i-1] == undefined ||
                         text[i-1] == '`' || text[i-1] == '"') ) {
                    var username = "";

                    // Get entire username with @ character
                    for( var l = 0; l < remainingLength; l++ ) {
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
                         text.substring(i, i+7) == 'http://') {
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

            html += '</p>';
        }

        // End html string
        html += '</div>';

        return html;
    }

});
