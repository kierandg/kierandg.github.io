<?php
// -----------------------------------------------------------------------------
// kierandg <kieran.dang@outlook.com>
// -----------------------------------------------------------------------------
//
// Clear status for test purposes only
// UPDATE prizes SET status = 0;
// UPDATE customers SET status = 0;
// -------------------------------------
// Customers table
// -------------------------------------
// CREATE TABLE IF NOT EXISTS `customers` (
// `id` int(11) NOT NULL,
// `contract_no` varchar(16) NOT NULL,
// `loc1` varchar(64) NOT NULL,
// `loc2` int(11) NOT NULL DEFAULT '0',
// `customer_name` varchar(255) NOT NULL,
// `address` varchar(255) DEFAULT NULL,
// `mobile` varchar(64) DEFAULT NULL,
// `home_phone` varchar(64) DEFAULT NULL,
// `work_phone` varchar(64) DEFAULT NULL,
// `date1` timestamp NULL DEFAULT NULL,
// `date2` timestamp NULL DEFAULT NULL,
// `date3` timestamp NULL DEFAULT NULL,
// `status` int(11) NOT NULL DEFAULT '0'
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

// -------------------------------------
// Available prizes table
// -------------------------------------
// CREATE TABLE IF NOT EXISTS `prizes` (
// `id` int(11) NOT NULL AUTO_INCREMENT,
// `type` int(11) NOT NULL DEFAULT '0',
// `loc1` varchar(64) NOT NULL,
// `loc2` int(11) DEFAULT '0',
// `status` int(11) NOT NULL DEFAULT '0',
// `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
// PRIMARY KEY (`id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
header("Cache-Control: no-cache, must-revalidate"); // HTTP 1.1
header("Pragma: no-cache"); // HTTP 1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

// mysql_query("SET NAMES 'utf8'");
header("Content-type: application/json; charset=utf-8");

// A simple seed
function make_seed() {

	list($usec, $sec) = explode(' ', microtime());
	return (float)$sec + ((float)$usec * 100000);
}

$type = 0;
$output = [
	'result' => 0, 'type' => $type
];

// DB connection
$server = 'localhost';
$username = 'root';
$password = '';
$dbname = 'paytvlab';

// Create connection
$conn = new mysqli($server, $username, $password, $dbname);

// Check connection
if($conn->connect_error) {
	$output['error'] = 'DB conn failed';
	echo json_encode($output);
	return;
}

// -----------------------------------------------------------------------------
// GET ALL AVAILABLE PRIZES FROM DB
// Should start transaction ? -> NOT NESSESARY, we have the only connection
// SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE
// -----------------------------------------------------------------------------
$sql = 'SELECT * FROM prizes WHERE status = 0 AND type = (SELECT MAX(type) FROM prizes WHERE status = 0) ORDER BY type DESC';
$result = $conn->query($sql);

if(!$result) {
	$output['error'] = 'DB error ' . $conn->error;
	echo json_encode($output);

	$conn->close();
	return;
}
else if($result->num_rows > 0) {

	$prizes = [];
	while($row = $result->fetch_assoc()) {
		$prizes[] = [
			'id' => $row['id'],
			'type' => $row['type'], // prize type: eg 1, 2, 3
			'loc1' => $row['loc1'], // province
			'loc2' => $row['loc2']	// branch
		];
	}

	// Get random prize from available
	$count = count($prizes);
	$rnd = rand(0, $count - 1);

	$prize = $prizes[$rnd];
	$output['type'] = $prize['type'];

	// SELECT random row
	$sql = 'SELECT * FROM customers WHERE status = 0 AND loc1 = \'' . $prize['loc1'] . '\' AND loc2 = ' .
			 $prize['loc2'] . ' AND id >= ##RAND## ORDER BY id ASC LIMIT 1';

	// Select until found a customer or die
	$customer = null;
	$cnt = 0;
	$lastError = null;
	$lastSql = null;

	while(!$customer && $cnt < 10) {
		$min = null;
		$max = null;

		// Get min and max ID of all customers in the same location who have received prizes yet
		$sqlMinMax = 'SELECT MIN(id) AS min, MAX(id) as max FROM customers WHERE status = 0 AND loc1 = \'' .
				 $prize['loc1'] . '\' AND loc2 = ' . $prize['loc2'];

		$result = $conn->query($sqlMinMax);
		if(!$result) {
			$output['error'] = 'DB error ' . $conn->error;
			echo json_encode($output);

			$conn->close();
			return;
		}
		else if($result->num_rows > 0) {
			while($row = $result->fetch_assoc()) {

				$min = $row['min'];
				$max = $row['max'];
				$lastSql = $sqlMinMax;
			}
		}
		else {
			// WTF ???????
			$lastError = 'Cannot find min/max ID, sql=' . $sqlMinMax;
			// $output ['error'] = 'Cannot find customer';
			// echo json_encode($output);

			// $conn->close();
			// return;
		}

		if(!$min || !$max) {
			continue;
		}

		// OK try random an ID from min to max
		srand(make_seed());

		$rnd = rand($min, $max);
		$sql1 = str_replace('##RAND##', $rnd, $sql);

		$result = $conn->query($sql1);
		if(!$result) {
			$output['error'] = 'DB error ' . $conn->error;
			echo json_encode($output);

			$conn->close();
			return;
		}
		else if($result->num_rows > 0) {
			while($row = $result->fetch_assoc()) {
				// -------------------------------------------------------------
				// FOUND CUSTOMER HERE
				// -------------------------------------------------------------
				$customer = [

					'id' => $row['id'],
					'contract_no' => $row['contract_no'],
					'customer_name' => $row['customer_name'],
					'address' => $row['address'],
					'mobile' => $row['mobile'],
					'loc1' => $row['loc1'],
					'loc2' => $row['loc2'],
					'min' => $min,
					'max' => $max
				];

				$lastSql = $sql1;
			}
		}
		else {
			// WTF ???????
			$lastError = 'Cannot find customer rnd=' . $rnd . ', sql=' . $sql1;
			// $output ['error'] = 'Cannot find customer';
			// echo json_encode($output);

			// $conn->close();
			// return;
		}

		$cnt++;
	}

	// -------------------------------------------------------------------------
	// CUSTOMER NOT FOUND, RETURN ERROR
	// -------------------------------------------------------------------------
	if(!$customer) {
		$output['error'] = $lastError;
		echo json_encode($output);

		$conn->close();
		return;
	}

	// -------------------------------------------------------------------------
	// UPDATE RESULT HERE
	// -------------------------------------------------------------------------
	// UPDATE status
	$ret = $conn->query('UPDATE customers SET status = ' . $prize['type'] . ' WHERE contract_no = \'' .
				 $customer['contract_no'] . '\'');
	if($ret === TRUE) {
	}

	// Update prizes
	$conn->query('UPDATE prizes SET status = 1 WHERE id = ' . $prize['id']);

	$output = [

		'result' => 1,
		'type' => $prize['type'],
		'id' => $customer['id'],
		'contract_no' => $customer['contract_no'],
		'customer_name' => $customer['customer_name'],
		'address' => $customer['address'],
		'mobile' => $customer['mobile'],
		'loc1' => $customer['loc1'],
		'loc2' => $customer['loc2'],
		'min' => $customer['min'],
		'max' => $customer['max'],
		'sql' => $lastSql
	];

	echo json_encode($output);
}
else {
	$output['error'] = 'No prize available';
	echo json_encode($output);

	$conn->close();
	return;
}

$conn->close();

?>