const mongoose = require('mongoose');
const Document = require('./Document');
mongoose.connect('mongodb://localhost/google-docs-clone',{
	useNewUrlParser:true,
	useuseUnifiedTopology:true,
	useuseFindAndModify:false,
	useCreateIndex:true
})


const io = require('socket.io')(3001,{
	cors:{
		origin:'http://localhost:3000',
		methods:["GET","POST"],
	}
})

const defaultValue = ""
io.on('connection',socket => {
	socket.on('get-document',async documentId => {
		const document = await findCreateDocument(documentId);
		socket.join(documentId)
		socket.emit('load-document',document.data)
		socket.on('send-changes',delta => {
		socket.broadcast.to(documentId).emit('recieve-changes',delta);
		})
		socket.on('save-document', async data =>{
					await Document.findByIdAndUpdate(documentId,{data})
		})
	})
	console.log("Connected");
})

async function findCreateDocument(id){
	if(id == null) return 
	const document = await Document.findById(id);
	if(document) return document
	return await Document.create({_id:id,data:defaultValue})
}