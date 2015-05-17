angular.module('starter.controllers', [])

    .controller('StatusCtrl', function ($scope, $http) {
        $scope.nama = nama;
        $scope.jkk = 1;
        $scope.jkm = 1;
        $scope.provinces = [];
        $scope.response = [];
        //load propinsi
        $http.get(url + 'bpjs/propinsi').success(function (data) {
            $scope.provinces = data;
        });
        //load kantor cabang
        $http.get(url + 'bpjs/cabang').success(function (data) {
            $scope.offices = data;
        });
        //load lokasi kerja
        $scope.rubah = function (propinsi) {
            $scope.areas = [];
            $http.get(url + 'bpjs/wilayah/propinsi/' + propinsi.kode_propinsi).success(function (data) {
                $scope.areas = data;
                //$scope.wilayah = {"kode_wilayah": $scope.response.kodepos_pekerjaan};
            });
        };
        //req status user
        $scope.kirim = function () {
            var nik = $scope.nik;
            var timestamp = date("YmdHis");
            var sign = Sha1.hash(username_trx + password_trx + timestamp);

            $scope.paramReq = {
                'userid': username_trx,
                'nik': nik,
                "timestamp": timestamp,
                "sign": sign,
                "prodName": "bpjstk"
            };

            $http.post(url + 'bpjs/status', $scope.paramReq, {
                headers: {'Content-Type': 'application/json'}
            }).success(function (data) {
                $scope.response = data;
                if (($scope.response.noerr >= 400) && ($scope.response.noerr < 500)) {
                    prop = $scope.response.kodepos_pekerjaan;
                    prop = prop.substring(0, 2);
                    $scope.propinsi = {"kode_propinsi": prop};
                    $scope.rubah($scope.propinsi);
                    //$scope.wilayah = {"kode_wilayah": $scope.response.kodepos_pekerjaan};
                    if ($scope.response.noerr == 400) {
                        $scope.user_status = "Ada pembayaran yang belum dibayar";
                    } else {
                        $scope.user_status = "User Aktif";
                    }

                    $scope.penghasilan = $scope.response.penghasilan;
                    if ($scope.response.program != undefined) {
                        prog = $scope.response.program.split(",");
                        $scope.jkk = 1;
                        $scope.jkm = 1;
                        for (i = 0; i < prog.length; i++) {
                            if (prog[i] == 'JHT') {
                                $scope.jht = 1;
                            }
                        }

                        nom = $scope.response.nominal_program.split("#");
                        $scope.nom_jht = 0;
                        $scope.nom_jkk = 0;
                        $scope.nom_jkm = 0;
                        for (i = 0; i < nom.length; i++) {
                            val = nom[i].split("=");
                            if (val[0] == "JHT") $scope.nom_jht = number_format(val[1],0,",",".");
                            if (val[0] == "JKK") $scope.nom_jkk = number_format(val[1],0,",",".");
                            if (val[0] == "JKM") $scope.nom_jkm = number_format(val[1],0,",",".");
                        }
                    }

                    if ($scope.response.cabang_bpjs != undefined) {
                        $scope.kantor = {"kode_kantor": $scope.response.cabang_bpjs};
                    }
                } else if ($scope.response.noerr == 500) {
                    $scope.user_status = "Check gagal";
                } else if ($scope.response.noerr == 540) {
                    $scope.user_status = "Gangguan Server";
                }
                if($scope.response.noerr==400){
                    $scope.jumlah_bayar = number_format($scope.response.jumlah_bayar,0,",",".");
                    $scope.biaya_transaksi = number_format(($scope.response.admin_transaksi + $scope.response.admin_registrasi),0,",",".");
                    $scope.total_bayar = number_format($scope.response.total_bayar,0,",",".");
                }
                $scope.noerr = $scope.response.noerr;
                $scope.nik = nik;
            });
        };
        $scope.inquiry = function(){
            $scope.log_id = 0;
            var timestamp = date("YmdHis");
            var sign = Sha1.hash(username_trx + password_trx + timestamp);
            var nik = $scope.nik;
            if($scope.periode==undefined) {
                alert("Silahkan pilih periode pembayaran");
                return false;
            }

            if($scope.wilayah==undefined){
                alert("Silahkan pilih lokasi kerja");
                return false;
            }
            if(is_login==0){
                //check tagihan dgn user blom login
                $scope.paramHitung = {
                    'userid': username_trx,
                    'nik': nik,
                    'periode' : $scope.periode,
                    'kodepos_pekerjaan' : $scope.wilayah.kode_wilayah,
                    'penghasilan' : $scope.penghasilan,
                    "jkk" : 1,
                    "jkm" : 1,
                    "jht" : $scope.jht,
                    "timestamp": timestamp,
                    "sign": sign,
                    "prodName": "bpjstk"
                };
                $http.post(url + 'bpjs/hitung', $scope.paramHitung, {
                    headers: {'Content-Type': 'application/json'}
                }).success(function (data) {
                    if(data.noerr==400){
                        nom = data.nominal_program.split("#");
                        $scope.nom_jht = 0;
                        $scope.nom_jkk = 0;
                        $scope.nom_jkm = 0;
                        for (i = 0; i < nom.length; i++) {
                            val = nom[i].split("=");
                            if (val[0] == "JHT") $scope.nom_jht = number_format(val[1],0,",",".");
                            if (val[0] == "JKK") $scope.nom_jkk = number_format(val[1],0,",",".");
                            if (val[0] == "JKM") $scope.nom_jkm = number_format(val[1],0,",",".");
                        }
                        $scope.jumlah_bayar = number_format(data.jumlah_bayar,0,",",".");
                        $scope.biaya_transaksi = number_format((data.admin_transaksi + data.admin_registrasi),0,",",".");
                        $scope.total_bayar = number_format(data.total_bayar,0,",",".");
                    }

                });
            }else{
                var rand = Math.floor((Math.random() * 100) + 1);
                var reffid = "BPJS"+date("YmdHis")+rand;
                $scope.reffid = reffid;
                $scope.paramInq = {
                    "userid":username_trx,
                    "reffid":reffid,
                    "target":nik,
                    "amount":"",
                    "terminal":"apps-bpjs",
                    "timestamp":timestamp,
                    "sign":sign,
                    "prodName":"bpjstk",
                    "periode":$scope.periode,
                    "data" : {
                        "pekerjaan" : $scope.response.pekerjaan,
                        "kodepos_pekerjaan" : $scope.wilayah.kode_wilayah,
                        "penghasilan" : $scope.penghasilan,
                        "jkk" : 1,
                        "jkm" : 1,
                        "jht" : $scope.jht,
                        "rate_jht" : 0
                    }
                }
                $http.post(url + 'routers/router', $scope.paramInq, {
                    headers: {'Content-Type': 'application/json'}
                }).success(function (res) {
                    $scope.log_id = 0;
                    if((res.noerr>=400)&&(res.noerr<500)){
                        $scope.log_id = res.log_id;
                        data = res.inquiry.data_inquiry;
                        $scope.nom_jht = number_format(data.nominal_jht,0,",",".");
                        $scope.nom_jkk = number_format(data.nominal_jkk,0,",",".");
                        $scope.nom_jkm = number_format(data.nominal_jkm,0,",",".");

                        $scope.jumlah_bayar = number_format(data.jumlah_bayar,0,",",".");
                        $scope.biaya_transaksi = number_format((data.admin_transaksi + data.admin_registrasi),0,",",".");
                        $scope.total_bayar = number_format(data.total_bayar,0,",",".");

                        data_status = res.inquiry.status;
                    }

                });
            }
        };

        $scope.bayar = function(){
            if(is_login==0){
                alert("Silahkan login terlebih dahulu");
            }else{
                var timestamp = date("YmdHis");
                var sign = Sha1.hash(username_trx + password_trx + timestamp);
                var nik = $scope.nik;
                $scope.paramBayar = {
                    "userid":username_trx,
                    "reffid":$scope.reffid,
                    "target":nik,
                    "amount": $scope.jumlah_bayar.replace(".",""),
                    "terminal":"apps-bpjs",
                    "timestamp":timestamp,
                    "sign":sign,
                    "prodName":"bpjstk",
                    "periode":$scope.periode,
                    "log_id" : $scope.log_id
                };
                $http.post(url + 'routers/payment', $scope.paramBayar, {
                    headers: {'Content-Type': 'application/json'}
                }).success(function (res) {
                    $scope.log_id = 0;
                    if((res.noerr==100)){
                        $scope.log_id = 0;
                        $scope.reffid = "";
                        data = res.payment.data_payment;
                        $scope.response.noerr = 100;
                        $scope.user_status = "Transaksi Sukses";
                        $scope.response.no_bpjs = data.no_bpjs;
                        $scope.response.kode_iuran = data.kode_iuran;
                        $scope.response.status.tgl_efektif = data.tgl_efektif;
                        $scope.response.status.tgl_akhir = data.tgl_akhir;
                    }else{
                        $scope.log_id = 0;
                        $scope.reffid = "";
                        $scope.response.noerr = 500;
                        $scope.user_status = "Transaksi Gagal";
                    }

                });
            }
        };
    })

    .controller('ChatsCtrl', function ($scope, Chats) {
        $scope.chats = Chats.all();
        $scope.remove = function (chat) {
            Chats.remove(chat);
        }
    })

    .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    })

    .controller('AccountCtrl', function ($scope,$http) {
        $scope.nama = nama;
        $scope.login = function () {
            $scope.userLogin = {
                "u": $scope.username,
                "p": $scope.password
            };
            $http.post(url+'partner/login',$scope.userLogin,{
                headers: { 'Content-Type': 'application/json'}
            }).success(function(data){
                if(data.noerr==0){
                    nama = data.username;
                    is_login = 1;
                    $http.get(url+'partner/partners/id/'+data.id_cust).success(function(dataUser){
                        username_trx = dataUser.username_trx;
                        password_trx = dataUser.password_trx;
                    });
                }
            });
        };
    });
