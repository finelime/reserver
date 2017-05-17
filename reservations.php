<?

$file = file_get_contents('reservations.json');

if(strlen($file) > 0){
	echo json_encode($file);
}else{
	echo "none";
}

?>