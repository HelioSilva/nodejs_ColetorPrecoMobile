var   Firebird = require('node-firebird');

const options = {
    host: '127.0.0.1',
    port: 3050,
    database: 'C:/SysPDV/Syspdv_srv.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
    lowercase_keys: false, // set to true to lowercase keys
    role: null,            // default
    pageSize: 4096         // default when creating database
}   

function a(){

    Firebird.attach(options, function(err, db) {
    
        if (err)
            throw err;

        // TABELA 1
  
        db.query('insert into ESTOQUE_MOVIMENTACAO (LOCCOD,PROCOD,MOVDAT,MOVQTD,MOVDOC,MOVMTV,FATCOD,FUNCOD) values(?,?,?,?,?,?,?,?) returning ID ',
           ['01','00000000000007',new Date(),10,'AJUSTE MOBILE','Baixa de Estoque','016','000001'], function(err, result) {
           
            console.log(result);  
            if(result){
                return result ;                         
            }                   

            // IMPORTANT: close the connection
            db.detach();
        });
    
    });

}

async function b(){

    Firebird.attach(options, function(err, db) {
    
        if (err)
            throw err;  
  
        // TABELA 2 
        let parametros = 'insert into ESTOQUE_AJUSTE_MOVIMENTACAO (LOCCOD,PROCOD,AJUCOD,EAMQTD, '+
            ' EAMVLRCST,EAMPROPRC1,EAMDAT,EAMHOR,FUNCOD )' ;

        db.query(parametros+' values (?,?,?,?,?,?,?,?,?) returning ID',
            ['01','00000000000007','01',10,0,0,new Date(),
                new Date().getHours()+new Date().getMinutes(),
            '000001'],
            function(err,resposta){

                console.log(resposta);
                if(resposta){
                    return resposta
                }

            db.detach();
        });  
    
    });
    
}



module.exports ={

    async alteraQTD(req,res){      
       

        Firebird.attach(options, function(err, db) {

            let {codBarras,newQtd} = req.body ;
            let procod = '';

            codBarras = "0".repeat(14 - String(codBarras).length) + codBarras;
    
            if (err)
                throw err;


                console.log("Solicitacao de Ajuste: barras "+codBarras);


            db.query('select procod as pro from PRODUTOAUX where PROCODAUX = ?',[codBarras],
            function(err,rows){
                
                if(rows != "undefined" && rows != null && rows.length != null
                && rows.length > 0){
                    procod = String(rows[0].PRO);

                    // Inserts no banco
                        // TABELA 1      
                        db.query('insert into ESTOQUE_MOVIMENTACAO (LOCCOD,PROCOD,MOVDAT,MOVQTD,MOVDOC,MOVMTV,FATCOD,FUNCOD) values(?,?,?,?,?,?,?,?) returning ID ',
                        ['01',String(procod),new Date(),newQtd,'AJUSTE MOBILE','Baixa de Estoque','016','000001'], function(err, result) {
                        
        
                        if(result){
                            // TABELA 2 
                                let parametros = 'insert into ESTOQUE_AJUSTE_MOVIMENTACAO (LOCCOD,PROCOD,AJUCOD,EAMQTD, '+
                                ' EAMVLRCST,EAMPROPRC1,EAMDAT,EAMHOR,FUNCOD )' ;

                            db.query(parametros+' values (?,?,?,?,?,?,?,?,?) returning ID',
                                ['01',String(procod),'01',newQtd,0,0,new Date(),
                                    new Date().getHours()+new Date().getMinutes(),
                                '000001'],
                                function(err,resposta){

                                    if(resposta){
                                        return res.json({
                                            codigo:100 ,
                                            msg : "Alterado com sucesso!"
                                        }) ;
                                    }else{
                                        return res.json({
                                            codigo:200 ,
                                            msg : "Erro na tabela 2!"
                                        }) ;
                                    }

                                db.detach();
                            });  
                                                    
                        } else {
                            return res.json({
                                codigo:200 ,
                                msg : "Erro na tabela 1!"
                            }) ;
                        }                  
            
                        // IMPORTANT: close the connection
                        db.detach();
                    });

                    // Fim dos inserts


                }else{
                    return res.json({
                        codigo:200 ,
                        msg : "Produto não encontrado!"
                    });
                }

                db.detach();
                
            });
    
            
        
        });  
            

    }


}