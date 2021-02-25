// Préréquis et définition du token + client + MessageEmbed
const {Client, MessageEmbed} = require('discord.js');
const client = new Client();
const token = '';
const ytdl = require('ytdl-core');
const search = require('yt-search');
const fs = require('fs');

// Variables
var servers = {};
var playlist = JSON.parse(fs.readFileSync('./playlist.json'));

//Tout les rôles dispo pour le loup Garou
var rolesLoup = ["Villageois", "Sorcière", "Cupidon", "Chasseur", "Voyante", "Petite Fille", "Garde", "Chaman", "Dictateur", "Chaperon Rouge", "Corbeau", "Détective", "Prêtre", "Faucheur", "Pirate", "Ancien", "Renard", "Chevalier à l'épé rouillé", "Loup Garou", "Infâme Père des loups", "Loup Blanc", "Ange", "Boufon", "Survivant", "Assassin", "Pyromane", "Chien-Loup", "Enfant sauvage"]

// Debug de login + Avctivité
client.on('ready', () =>{
    console.log("Client ready !");
    client.user.setActivity("Taper help dans #bot");
})

// Event de message
client.on('message', msg =>{

    // Définition des arguments
    let args = msg.content.split(" ");
    let cmd = args[0]

    //Anti spam + DM interdit
    if(msg.author.bot) return;
    if(!msg.guild) return;

    //Initialisation des var par serveur
    if(!servers[msg.guild.id]) servers[msg.guild.id] = {queue: [],search: [],queueTitles: [], ping: 0, playing: false, loupgarou: {changeneral: null, chanvocal: null, chanloups: null, chanamoureux: null, enCour : false, joueurs: [], roles: [], MJ: null}};

    //Pointeurs server
    var server = servers[msg.guild.id];
    var changeneral = server.loupgarou.changeneral;
    var chanloups = server.loupgarou.chanloups;
    var chanamoureux = server.loupgarou.chanamoureux;
    var chanvocal = server.loupgarou.chanvocal;
    var joueurs = server.loupgarou.joueurs;
    var roles = server.loupgarou.roles;
    var MJ = server.loupgarou.MJ;

    //Commandes qui sont autorisées dans tout les channels

    //Say, répète ce que l'utilisateur met en argument
    if(cmd == 'say'){
        if(!args[1]) return msg.reply("Pourquoi tu me réveilles pour rien ?");
        msg.channel.send(args.slice(1).join(' '));
    }

    //Profile, retourne le profil de l'utilisateur mentioné
    if(cmd == 'profile'){
        if(args[1]){
            var member = msg.mentions.members.first();
        }else var member = msg.member;
        const embed = new MessageEmbed()
                .setColor(msg.guild.member(member).highestRole.color)
                .setTitle('Profile')
                .addField('Nom', member.user.username)
                .addField('Surnom', msg.guild.member(member).nickname)
                .setThumbnail(member.user.avatarURL);
        msg.channel.send(embed);
    }

    //Comande du MJ pour ajouter qqun aux channels loups et amoureux
    if(msg.channel == chanamoureux && msg.member == MJ && cmd == "ajouter"){
        var cible = null;
        joueurs.forEach(function(item, index, array){
            if(item.nickname == args.slice(1).join(' ') || item.user.username == args.slice(1).join(' ')) cible = item;
        })
        if(cible != null){
            chanamoureux.createOverwrite(cible, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true
            });
            msg.reply(cible.displayName + " a été ajouté !")
        }else msg.reply("Aucun joueurs n'a ce nom");
    }
    if(msg.channel == chanloups && msg.member == MJ && cmd == "ajouter"){
        var cible = null;
        joueurs.forEach(function(item, index, array){
            if(item.nickname == args.slice(1).join(' ') || item.user.username == args.slice(1).join(' ')) cible = item;
        })
        if(cible != null){
            chanloups.createOverwrite(cible, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true
            });
            msg.reply(cible.displayName + " a été ajouté !")
        }else msg.reply("Aucun joueurs n'a ce nom");
    }

    //Jeu du loup garou, dans le channel loup-garou
    if(msg.channel.name == "loup-garou"){
            if(cmd == "help") msg.reply("Tapez go pour avoir toutes les instructions")

            //Ici, initialisation des variables du jeu : les joueurs, les rôles, le MJ et detection des channels text + vocal
            if(cmd == "go" && !server.loupgarou.enCour){
                //Ettonament les pointeurs marchent pas dans ce bloc
                //définition des chans généraux
                server.loupgarou.changeneral = msg.channel;
                server.loupgarou.chanvocal = msg.guild.channels.cache.find(channel => channel.name === "Loup Garou" && channel.type == 'voice');

                //Définition des variables de jeu
                server.loupgarou.joueurs = server.loupgarou.chanvocal.members.array();
                server.loupgarou.roles = [];
                server.loupgarou.MJ = null;
                server.loupgarou.enCour = false;
                
                if(server.loupgarou.joueurs.length < 1) return msg.channel.send("Il faut au moins 4 joueurs dans le channel pour commencer la partie");

                msg.channel.send("Bienvenue dans le village de Thiercelieux, voici les règles du jeu :\n- Il est interdit de se DM sauf si le MJ (moi) vous y invite\n\nVoici les rôles disponibles :\n\nLes rôles de villageois :\n- Villageois\n- Sorcière\n- Cupidon\n- Chasseur\n- Voyante\n- Petite Fille\n- Garde\n- Chaman\n- Dictateur\n- Chaperon Rouge\n- Corbeau\n- Détective\n- Prêtre\n- Faucheur\n- Pirate\n- Ancien\n- Renard\n- Chevalier à l'épé rouillé\n\nLes rôles Loup Garou :\n- Loup Garou\n- Infâme Père des loups\n\nLes rôles spéciaux :\n- Loup Blanc\n- Ange\n- Boufon\n- Survivant\n- Assassin\n- Pyromane\n- Chien-Loup\n- Enfant sauvage\n\nPour ajouter un rôle à la partie tapez role+ suivi du nombre à implémenter et du nom du rôle, ex : role+ 4 villageois\nPour Enlever un rôle il suffit de faire la même commance mais avec role- ex : role- 4 Villageois\nPour avoir des infos sur un rôle tapez info suivi du nom du rôle ex : info Garde\nPour voir la liste des rôles ajoutés à la partie tapez simplement roles");
            }

            //Ignore toutes les commandes si le jeu n'a jamais été initialisé
            if (changeneral == null) return;

            //Stop la game en cour
            //Ettonament les pointeurs marchent pas dans ce bloc
            if(cmd == "gameover" && msg.member == MJ){
                server.loupgarou.joueurs = [];
                server.loupgarou.roles = [];
                server.loupgarou.MJ = null;
                server.loupgarou.enCour = false;
                if(chanamoureux) chanamoureux.delete();
                if(chanloups) chanloups.delete();
                msg.reply("La partie est finie, merci d'avoir joué");
            }

            //évite d'executer les commandes si une partie a été arrêtée
            if(joueurs == []) return;

            if(cmd == "MJ" && !server.loupgarou.enCour){
                server.loupgarou.MJ = msg.member;
                msg.reply("Tu es maintenant MJ");
            }

            //Ajoute un rôle à la liste des roles
            if(cmd == "role+" && !server.loupgarou.enCour){
                var exist = false;
                rolesLoup.forEach(function(item, index, array){
                    if(item == args.slice(2).join(' ')){
                        exist = true;
                    }
                });
                if (!exist) return msg.reply("Ce rôle n'existe pas");
                if(roles.length + parseInt(args[1]) > joueurs.length) return msg.reply("Il y aurait plus de rôles que de joueurs !");
                for(var i = 1; i <= args[1]; i++) roles.unshift(args.slice(2).join(' '));
                msg.reply(args[1] + " " + args.slice(2).join(' ') + " ajouté(s)")

                //Si nbre rôles = nbre joueurs on peut commencer
                if(roles.length == joueurs.length) changeneral.send("Il y a assez de rôles pour commencer la partie, pour démarer tapez commencer");
            }

            //Enlève un rôle à la liste de roles
            if(cmd == "role-" && !server.loupgarou.enCour){
                var exist = false;
                for(var i = 1; i <= args[1]; i++){
                    roles.forEach(function(item, index, array){
                        if(item == args.slice(2).join(' ')){
                            exist = true;
                            roles.splice(index, 1);
                        }
                    });
                }
                if (!exist) return msg.reply("Ce rôle n'existe pas ou n'a pas été ajouté à la partie");
                msg.reply(args[1] + " " + args.slice(2).join(' ') + " enlevé(s)")
            }

            //Retourne la liste des rôles
            if(cmd == "roles") {
                if(roles[0]){
                    changeneral.send(roles.join(', '));
                }else return msg.reply("Il n'y a pas de rôles ajoutés pour l'instant");
            }

            //Commence la partie, attribut un rôle à chaques joueurs et donne la liste des rôles au MJ
            if(cmd == "commencer" && !server.loupgarou.enCour){
                if(MJ == null) return msg.reply("Il faut un MJ");
                if(roles.length < joueurs.length) return msg.reply("Il faut ajouter plus de rôles");
                var distributeJoueurs = [];
                var distributeRoles = [];

                server.loupgarou.joueurs.forEach(function(item, index, array){
                    distributeJoueurs[index] = item;
                });

                server.loupgarou.roles.forEach(function(item, index, array){
                    distributeRoles[index] = item;
                });

                var rolesStr = "";
                msg.guild.channels.create("les-loups", {type: 'text'}).then(function(channel){
                    //Ettonament les pointeurs chanloups et chanamoureux ne marchent pas dans ce bloc
                    server.loupgarou.chanloups = channel;
                    channel.createOverwrite(msg.guild.roles.everyone, {
                        SEND_MESSAGES: false,
                        VIEW_CHANNEL: false
                    });
                    channel.createOverwrite(MJ, {
                        SEND_MESSAGES: true,
                        VIEW_CHANNEL: true
                    });
                    msg.guild.channels.create("les-amoureux", {type: 'text'}).then(function(channel){
                        //Ettonament les pointeurs chanloups et chanamoureux ne marchent pas dans ce bloc
                        server.loupgarou.chanamoureux = channel;
                        channel.createOverwrite(msg.guild.roles.everyone, {
                            SEND_MESSAGES: false,
                            VIEW_CHANNEL: false
                        });
                        channel.createOverwrite(MJ, {
                            SEND_MESSAGES: true,
                            VIEW_CHANNEL: true
                        });
                        for(var i = 0; i < joueurs.length; i++){
                            var random = Math.floor(Math.random()*(distributeJoueurs.length))
                            distributeJoueurs[random].send("Tu es " + distributeRoles[0]);
                            if(distributeRoles[0] == "Loup Garou" || distributeRoles[0] == "Infâme Père des loups" || distributeRoles[0] == "Loup Blanc") server.loupgarou.chanloups.createOverwrite(distributeJoueurs[random], {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true
                            });
                            console.log(distributeJoueurs[random].displayName + " est " + distributeRoles[0]);
                            rolesStr += distributeJoueurs[random].displayName + " est " + distributeRoles[0] + "\n";
                            distributeRoles.shift();
                            distributeJoueurs.splice(random, 1);
                            server.loupgarou.enCour = true;
                        }
                        //Ettonament les pointeurs chanloups et chanamoureux ne marchent pas dans ce bloc
                        server.loupgarou.chanloups.send("Vous êtes Loups garou, vous pouvez parler tranquilement entre vous ici. Le MJ peut à tout moment rajouter quelqu'un dans ce channel en tapant ajouter suivi du nom de la personne");
                        server.loupgarou.chanamoureux.send("Pour ajouter les amoureux tapez ajouter suivi du nom de la personne")
                        MJ.send(rolesStr);
                    })
                })
            }
            
            //Créé un vote avec un système de réactions
            if(cmd == "votes" && server.loupgarou.enCour){
                var votesStr = "";
                for(var i = 1; i <= joueurs.length; i++){
                    votesStr += "[" + String.fromCharCode(96+i) + "] " + joueurs[i-1].displayName + "\n";
                }
                changeneral.send(votesStr + "\nFaîtes vos votes en cliquant sur les lettres correspondantes :").then(function(message){
                    message.react("🇦").then(() => message.react("🇧")).then(() => message.react("🇨")).then(() => message.react("🇩")).then(() => message.react("🇪")).then(() => message.react("🇫")).then(() => message.react("🇬")).then(() => message.react("🇭")).then(() => message.react("🇮")).then(() => message.react("🇯")).then(() => message.react("🇰")).then(() => message.react("🇱")).then(() => message.react("🇲")).then(() => message.react("🇳")).then(() => message.react("🇴")).then(() => message.react("🇵"));
                });
            }
            /*
            var filter = function(m){
                var exist = false;
                joueurs.forEach(function(item, index, array){
                    if(item.id == m.member.id && (m.content.split(" ").slice(1).join(' ') == item.user.username || m.content.split(" ").slice(1).join(' ') == item.nickname)) exist = true;
                });
                return exist && (m.content.startsWith('vote') && m.content != "votes");
            }
            msg.channel.awaitMessages(filter, {max: joueurs.length, time: 120000, errors: ['time']}).then(collected => console.log(collected)).catch(collected => console.log("time over" + collected))
            */
    }

    //Restriction de channel
    if(msg.channel.name != 'bot') return;

    // Commandes, uniquement dans le channel bot

    //Jeu du ping pong
    if(cmd == 'ping'){
        if(server.ping == 5){
            msg.reply("Pong, you lost newbie !");
            server.ping = 0;
        }else{
            msg.reply("Pong !");
            server.ping += 1;
        }
    }

    //Help
    if(cmd == 'help'){
        msg.reply("Voici la liste des commandes :\n\nping\nplay (f) [titre ou url] : joue une musique dans ton channel, tu peux mettre dirrectement l'url ou mettre le nom de la musique pour faire une recherche. L'argument f permet de faire passer une musique en prioritaire dans la queue. EX : play Wariors Imagine Dragons\nplaylist cr [nom] : créé une playlist\nplaylist del [nom] : suprime la playlist\nplaylist add [nom] [url] : ajoute la musique via url à la playlist portant le nom ciblé\nplaylist rm [nom] [n] : retire la nième musique de la playlist portant le nom ciblé\nplaylist list (nom) : retourne la liste de toutes les playlist, si il y a un nom : retourne la liste des musique dans la playlist portant le nom ciblé\nplaylist [nom] : joue l'entièreté de la playlist portant le nom ciblé\nskip : passe la musique qui est en train d'être jouée\nstop : passe la musique et efface la queue\nqueue : donne la liste des musique dans la fil d'attente\nloup : initialise les channels pour pouvoir jouer au loup garou");
    }

    //Play
    if(cmd == 'play' || cmd == 'playlist'){

        function play(connection, msg){
            server.playing = true;
            var queue0 = server.queue[0]

            ytdl.getInfo(queue0, function(err,info){
                let embed = new MessageEmbed()
                    .setColor('#1ABC9C')
                    .setTitle('Playing')
                    .addField(info.player_response.videoDetails.title, queue0);
                msg.channel.send(embed);
            })

            server.dispatcher = connection.play(ytdl(queue0, {filter: 'audioonly'}));
            server.dispatcher.setVolume(0.1);

            server.queue.shift();
            server.queueTitles.shift();

            server.dispatcher.on('finish', function(){
                server.playing = false;
                if(server.queue[0]){
                    play(connection, msg)
                }else connection.disconnect();
            });
        }

        let url = args[1];

        if(cmd == 'playlist'){

            if(args[1] == 'cr'){
                if(!args[2]) return msg.reply("Indique un nom");
                playlist[args[2]] = [];
                msg.reply("Playlist créée !");
                fs.writeFileSync('./playlist.json',JSON.stringify(playlist));
                return;
            }else
            if(args[1] == 'del'){
                if(!args[2]) return msg.reply("Indique un nom");
                delete playlist[args[2]];
                msg.reply("playlist supprimée !");
                fs.writeFileSync('./playlist.json',JSON.stringify(playlist));
                return;
            }else
            if(args[1] == 'add'){
                if(!args[2]) return msg.reply("Indique un nom");
                if(!playlist[args[2]]) return msg.reply("Cette playlist n'existe pas");
                if(!(args[3].slice(0, 19) == "https://youtube.com")) return msg.reply("Mets une url valide");
                playlist[args[2]].push(args[3]);
                msg.reply("musique ajoutée !");
                fs.writeFileSync('./playlist.json',JSON.stringify(playlist));
                return;
            }else
            if(args[1] == 'rm'){
                if(!args[2]) return msg.reply("Indique un nom");
                if(!playlist[args[2]]) return msg.reply("Cette playlist n'existe pas");
                if(args[3] > Object.keys(playlist[args[2]]).length) return msg.reply("Mets un chiffre valide");
                playlist[args[2]].splice(args[3]-1,1);
                msg.reply("Musique enlevée !");
                fs.writeFileSync('./playlist.json',JSON.stringify(playlist));
                return;
            }if(args[1] == 'list'){
                if(!args[2]){
                    var playlistStr = "";
                    for(var [index, item] of Object.entries(playlist)){
                        playlistStr = playlistStr + index + ", ";
                    }
                    let embed = new MessageEmbed()
                        .setColor('#2ECC71')
                        .setTitle("Playlist(s)")
                        .setDescription(playlistStr);
                    msg.channel.send(embed);
                    return;
                }
                if(!playlist[args[2]]) return msg.reply("Cette playlist n'existe pas");
                let embed = new MessageEmbed()
                        .setColor('#2ECC71')
                        .setTitle(args[2])
                        .setDescription(playlist[args[2]]);
                    msg.channel.send(embed);
                    return;
            }else{
                if(!args[1]) return msg.reply("Indique un nom");
                if(!playlist[args[1]]) return msg.reply("Cette playlist n'existe pas");
                url = playlist[args[1]][0];
                for(var i = 1; i < Object.keys(playlist[args[1]]).length; i++){
                    server.queue.unshift(playlist[args[1]][i]);
                }
            }
        }

        //L'argument f met la musique en début de queue à la place de la mettre en fin de queue
        if(url == "f") url = args[2];
        if(!url) return msg.reply("Indique un url ou un nom pour lancer une recherche de musique");
        if(!msg.member.voice.channel) return msg.reply("Il faut être dans un channel vocal");

        if(!(url.slice(0, 19) == "https://youtube.com")){
            var nb = parseInt(url);
            if(nb && nb <= 10 && server.search[0]){
                 url = server.search[nb-1];
                 if(args[1] == "f"){
                    server.queue.unshift(url);
                 }else server.queue.push(url);
                 if(server.playing){
                    ytdl.getInfo(url, function(err,info){
                        if(args[1] == "f"){
                            server.queueTitles.unshift(info.player_response.videoDetails.title);
                        }else server.queueTitles.push(info.player_response.videoDetails.title);

                        let embed = new MessageEmbed()
                            .setColor('#2ECC71')
                            .setTitle('Ajouté à la queue')
                            .addField(info.player_response.videoDetails.title, url);
                        msg.channel.send(embed);
                    });
                }
                 if(!server.playing) msg.member.voice.channel.join().then(function(connection){play(connection, msg);})
            }else{
                let title = args.slice(1).join(' ');
        
                search(title, function( err, r){
                    for(var i = 0; i <= 9; i++) server.search[i] = r.videos[i].url;

                    let embed = new MessageEmbed()
                        .setColor('#3498DB')
                        .setTitle('Résultats');
                    for(var i = 1; i <= 10; i++){
                        embed.addField("[" + i + "]" + r.videos[i-1].title, server.search[i-1]);
                    }
                    msg.channel.send(embed);
                });
            }
        }else{
            if(args[1] == "f"){
                server.queue.unshift(url);
            }else server.queue.push(url);

            ytdl.getInfo(url, function(err,info){
                if(args[1] == "f"){
                    server.queueTitles.unshift(info.player_response.videoDetails.title);
                }else server.queueTitles.push(info.player_response.videoDetails.title);
            });

            if(server.playing){
                ytdl.getInfo(url, function(err,info){
                let embed = new MessageEmbed()
                    .setColor('#2ECC71')
                    .setTitle('Ajouté à la queue')
                    .addField(info.player_response.videoDetails.title, url);
                msg.channel.send(embed);
                });
            }
            
            if(!server.playing) msg.member.voice.channel.join().then(function(connection){play(connection, msg);})

        }
    }

    //Skip ( va avec le Play)
    if(cmd == 'skip'){
        if(server.dispatcher) server.dispatcher.end();
    }

    //Stop ( va avec le Play)
    if(cmd == 'stop'){
        if(msg.guild.voice.connection){
            for(var i = server.queue.length -1; i >= 0; i--){
                server.queue.splice(i, 1);
                server.queueTitles.splice(i, 1);
            }
            server.dispatcher.end();
        }
    }

    //Queue ( va avec le Play)
    if(cmd == 'queue'){
        if(!servers[msg.guild.id].queue[0]) return msg.reply("La queue est vide.");
        let embed = new MessageEmbed()
            .setColor('#2ECC71')
            .setTitle('Queue');
        for(var i = 1; i <= Math.min(server.queue.length, 10); i++) embed.addField("[" + i + "]" + server.queueTitles[i-1], server.queue[i-1]);
        msg.channel.send(embed);
    }

    //Volume ( va avec le Play)
    if(cmd == "volume"){
        if(!args[1]) return msg.reply("Mon volume est de " + server.dispatcher.volume*100 + "%");
        if(parseInt(args[1]) > 100 || parseInt(args[1]) < 0) return msg.reply("Veuillez indiquer un nombre entre 0 et 100");
        server.dispatcher.setVolume(parseInt(args[1])/100);
    }

    //Pause ( va avec le Play)
    if(cmd == "pause"){
        server.dispatcher.pause();
    }
    //Lecture ( va avec le Play)
    if(cmd == "lecture"){
        server.dispatcher.resume();
    }

    //Jeu du loup garou, initialisation des channels
    if(cmd == 'loup'){
        msg.reply("Je vous invite à regarder dans le text channel loup-garou pour commencer une parite");
        if(msg.guild.channels.cache.find(channel => channel.name === "loup-garou" && channel.type == 'text') == null){
            msg.guild.channels.create("loup-garou", {type: 'text'}).then(function(channel){
                var textchan = channel;
                textchan.send("Les participants sont priés de rejoindre le channel vocal Loup Garou, pour commencer la partie tapez go");
                msg.reply("Un text channel Loup Garou a été créé, regardez en bas de la liste des text channels");
                if(msg.guild.channels.cache.find(channel => channel.name === "Loup Garou" && channel.type == 'voice') == null){
                    msg.guild.channels.create("Loup Garou", {type: 'voice'}).then(function(channel){
                        textchan.send("Un channel vocal Loup Garou a été créé, regardez en bas de la liste des channels vocaux");
                    });
                }
            });
        }else{
            var textchan = msg.guild.channels.cache.find(channel => channel.name === "loup-garou" && channel.type == 'text');
            textchan.send("Les participants sont priés de rejoindre le channel vocal Loup Garou, pour commencer la partie tapez go");
            if(msg.guild.channels.cache.find(channel => channel.name === "Loup Garou" && channel.type == 'voice') == null){
                msg.guild.channels.create("Loup Garou", {type: 'voice'}).then(function(channel){
                    textchan.send("Un channel vocal Loup Garou a été créé, regardez en bas de la liste des channels vocaux");
                });
            }
        }
    }
})

client.login(token);
