<?php
    $issueID = $_GET['i'];
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Issue <?php echo $issueID; ?> | GitHub API</title>
    <link rel="stylesheet" href="style.css" type="text/css" />

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
    <script src="issue.js" type="text/javascript"></script>
</head>


<body>
    <div id="container">
        <h1>Issue <?php echo $issueID; ?></h1>

        <div class="issue" id="<?php echo $issueID; ?>"></div>

        <div id="comments">
            <h1>Comments</h1>
        </div>
    </div>
</body>

</html>
