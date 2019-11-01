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

module.exports ={

    async consultaProduto(req,res){
        let sql ='Select PRODUTO.PROCOD ,PRODUTO.PRODES ,PRODUTO.PROUNID ,PRODUTO.PROPRCVDAVAR , '+
           'ESTOQUE.ESTATU from PRODUTO,ESTOQUE,PRODUTOAUX '+
           'where PRODUTO.PROCOD = ESTOQUE.PROCOD AND '+
           'PRODUTO.PROCOD = PRODUTOAUX.PROCOD AND '+
           'PRODUTOAUX.PROCODAUX = ? ' ;

           console.log(req.body);

           Firebird.attach(options, function(err, db) {

                let {codBarras,newQtd} = req.body ;
                codBarras = "0".repeat(14 - String(codBarras).length) + codBarras;
                console.log(codBarras);

                if (err)
                throw err;

                db.query(sql,[codBarras],
                function(err,rows){

                    console.log(rows[0]);

                    if(rows != "undefined" && rows != null && rows.length != null
                    && rows.length > 0){

                        return res.json({
                            codigo:100,
                            msg:'Consulta realizada com sucesso!',
                            dados:rows[0]
                        })

                    }  else {
                        return res.json({
                            codigo:200,
                            msg:'Nenhum produto encontrado!'
                        })
                    }              
                
                    db.detach(); 
                });



           });
        
    },

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
                        db.query('insert into ESTOQUE_MOVIMENTACAO (LOCCOD,PROCOD,MOVDAT,MOVQTD,MOVDOC,MOVMTV,FATCOD,FUNCOD,MOVTIP,MOVESP) values(?,?,current_date,?,?,?,?,?,?,?) returning ID ',
                        ['01',String(procod),newQtd,'AJUSTE MOBILE','','016','000001','A','AJU'], function(err, result) {
                        
        
                        if(result){
                            // TABELA 2 
                                let parametros = 'insert into ESTOQUE_AJUSTE_MOVIMENTACAO (LOCCOD,PROCOD,AJUCOD,EAMQTD, '+
                                ' EAMVLRCST,EAMPROPRC1,EAMDAT,EAMHOR,FUNCOD )' ;

                            db.query(parametros+' values (?,?,?,?,?,?,current_date,?,?) returning ID',
                                ['01',String(procod),'01',newQtd,0,0,
                                   String(new Date().getHours())+String(new Date().getMinutes()),
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