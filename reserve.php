<?

$contents = file_get_contents('reservations.json');
$json = [];
if(strlen($contents) > 0){
	$json = json_decode($contents);
}

$now = round(microtime(true) * 1000);
for($i = 0; $i < count($json); $i++){
	if($now - $json[$i]->millis > 3600000){
		array_splice($json, $i, 1);
	}
}

$new = json_decode($_POST["obj"]);
$json[] = $new;

$encoded = json_encode($json);
$file = fopen("reservations.json", "w");
fwrite($file, $encoded);
fclose($file);

?>