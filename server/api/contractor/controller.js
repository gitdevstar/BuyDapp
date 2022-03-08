const fs = require("fs"),
    moment = require('moment'),
    Task = require("../../models/Task"),
    MSDS =require("../../models/MSDS"),
    Docket = require("../../models/Docket"),
    History = require("../../models/Transaction"),
    doc_conf = require("../../config/doc");

const {
    PDFDocument,
    PDFDocumentWriter,
    StandardFonts,
    drawLinesOfText,
} = require('pdf-lib');

const mongoose = require('mongoose');

class ContractorController {

    loadTask() {
        /**
         * create db - Tasks - id/title/description/
         */
        return Task.find({}).then(result => {
            return result;
        });
    }

    // loadMSDS() {
    //     /**
    //      * create db - MSDS - id/title/description/
    //      */
    //     return MSDS.find({}).then(result => {
    //         return result;
    //     });
    // }

    loadWorkAday(req) {
        // var dateStr = moment().format('YYYY-MM-DD');
        console.log('loadworkall', req.username);
        var dateStr = moment().format('YYYY-MM-DD');
        console.log('today', dateStr)
        return History.find({'username': {$eq: req.username}, 'date': {$eq: dateStr}}).then(result => {
            return result;
        });
    }

    async editWork(req) {
        
        var dateStr = moment().format('YYYY-MM-DD');

        return await History.findOne({_id: req._id}).then(record => {
            if(record) {
                if(record.starttime)
                    record.starttime = req.starttime
                if(record.endtime)
                    record.endtime = req.endtime
                if(record.lunchtime)
                    record.lunchtime = req.lunchtime
                if(record.hour)
                    record.hour = req.hour
                record.notes = req.notes

                return record.save().then( result => {
                    return History.find({'username': {$eq: req.username}, 'date': {$eq: dateStr}}).then(result => {
                        return result;
                    })}
                );
               
            }
        });
    }

    async deleteWork(req){

        var dateStr = moment().format('YYYY-MM-DD');

        await History.findByIdAndRemove(req._id);

        return History.find({'contractor': {$eq: req.contractor}, 'date': {$eq: dateStr}}).then(result => {
            return result;
        });
    }

    loadWorkAll(req) {
        console.log('loadworkall', req.user.username);
        return History.find({'username': {$eq: req.user.username}}).then(result => {
            return result;
        });
    }
    
    async saveTask(req) {
        /**
         * create db-TaskHistory- who/whicktask/starttime/endtime/[lunchtime]/[lunchhour]/[status]/notes/[docpath]/date
         */
        var task = req.task;
        var user = req.user;
        console.log(user);
        var dateStr = moment().format('YYYY-MM-DD');
        
        return await History.findOne({_id: task._id}).then(record => {
            if(!record) {
                record = new History({
                    contractor: mongoose.Types.ObjectId(user._id),
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    taskcode: task.code,
                    tasktitle: task.title,
                    starttime: task.start,
                    endtime: task.end,
                    hour: task.hour,
                    notes: task.notes,
                    date: dateStr
                });
                
                return record.save().then(result => {
                    if(result)
                        return History.find({'username': {$eq: user.username}, 'date': {$eq: dateStr}});
                });
            }
        })
        
    }
    
    async saveLunch(req) {
        /**
         * create db-WorkHistory- who/[whicktask]/[starttime]/[endtime]/lunchtime/lunchhour/[status]/[notes]/[docpath]/date
         */
        var dateStr = moment().format('YYYY-MM-DD');

        return await History.findOne({_id: req._id}).then(record => {
            if(!record) {
                record = new History({
                    contractor: req._id,
                    username: req.username,
                    firstname: req.firstname,
                    lastname: req.lastname,
                    lunchtime: req.lunch,
                    hour: req.lunchhour + 'hr',
                    date: dateStr
                })

                return record.save().then(result => {
                    if(result)
                        return History.find({'username': {$eq: req.username}, 'date': {$eq: dateStr}});
                })
           }
        })

                
    }
    
    async createDocket(req) {
        /**
         * db-TaskHistory- [who]/[whicktask]/[starttime]/[endtime]/[lunchtime]/[lunchhour]/[status]/[notes]/[docpath]/[date]
         * sendModifDocket
         */
        req = req.user;

        var dateStr = moment().format('YYYY-MM-DD');

        var docket = await Docket.find({'contractorname': {$eq: req.username}, 'date': {$eq: dateStr}}).then(result => {
            return result;
        });

        console.log('docket_no', docket.length);

        if(docket.length > 0)
            return false;

        if(!fs.existsSync(doc_conf.task_path)) {
            fs.mkdirSync(doc_conf.task_path);
        }

        var data = await History.find({'username': {$eq: req.username}, 'date': {$eq: dateStr}}).then(result => {
            return result;
        });

        const assets = {
            doc: fs.readFileSync(doc_conf.pattern_doc),
        };

        var pdfDoc=null;

        try{
            pdfDoc = await PDFDocument.load(assets.doc);
       
            const COURIER_FONT = 'Courier';

            if(pdfDoc !== null) {

                var config_pos = doc_conf.pos;
                var config_step = doc_conf.step;

                const pages =  pdfDoc.getPages();
                const existingPage = pages[0];
                //.addFontDictionary(COURIER_FONT, courierRef);
               await  data.map((item, index) => {
                    if(index > 0){
                        config_pos.item.y = config_pos.item.y - config_step;
                        config_pos.start.y = config_pos.start.y - config_step;
                        config_pos.finish.y = config_pos.finish.y - config_step;
                        config_pos.lunch.y = config_pos.lunch.y - config_step;
                        config_pos.hour.y = config_pos.hour.y - config_step;
                        config_pos.notes.y = config_pos.notes.y - config_step;
                    }

                    if(item.tasktitle)
                        existingPage.drawText(item.tasktitle, config_pos.item)
                    if(item.starttime)
                        existingPage.drawText(item.starttime, config_pos.start)
                    if(item.endtime)
                        existingPage.drawText(item.endtime, config_pos.finish)
                    if(item.lunchtime){
                        existingPage.drawText(item.lunchtime, config_pos.lunch)
                    }
                    if(item.hour)
                    existingPage.drawText(item.hour, config_pos.hour)
                    if(item.notes)
                        existingPage.drawText(item.notes, config_pos.notes)
                })

                // const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

                const pdfBytes =  await pdfDoc.save();

               

                var path = doc_conf.task_path + req.username + '_' +  moment().format('YYYYMMDDkkmmss') + '.pdf';
               
                const filePath = path;

                await fs.writeFileSync(filePath, pdfBytes);

                return await Docket.findOne({'contractorname': {$eq: req.username}, 'date': {$eq: dateStr}}).then(record => {
                    if(!record) {
                        record = new Docket({
                            contractorid: req._id,
                            contractorname: req.username,
                            email: req.email,
                            date: dateStr,
                            path: path,
                        });
                        return record.save().then(result => {
                           return result
                        })
                   }
                })

                // var file= fs.createReadStream(filePath);
                // return file
                // return pdfBytes
            } 
        }
        catch(err){
            console.log("loading error", err)
        }
        
    }
}
module.exports = new ContractorController()
