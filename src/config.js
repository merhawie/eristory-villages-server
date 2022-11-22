if (process.env.NODE_ENV != 'production') require('dotenv').load();

module.exports = {
	APPNAME: process.env.APPNAME || 'Eristory | Villages',
  PORT: process.env.PORT || 3000,
  DEVMODE: (process.env.NODE_ENV != 'production'),
	
	mongo: {
		uri: 'mongodb+srv://eristory-villages.afa2k.mongodb.net/eristory-villages?retryWrites=true&w=majority',
		connectionOptions: 
		{
			user: 'eristory',
			pass: 'f?~MZt^ZDAcU2NJQ_DP^',
			useNewUrlParser: true
		}
	},
	ig: {
		client_id: '1916562205158447',
		client_secret: '489bc86c0fbfcf853513e1da3496694b'
	}
};

