import { Request, Response } from 'express';
import mailingService from '../mailing/mailing.service';
import suggestService from './suggest.service';
import {
  createDirectus,
  createItem,
  readItem,
  rest,
  staticToken,
} from '@directus/sdk';
import { SuggestionType } from '../../types/Suggest';

const makeSuggestion = async (req: Request, res: Response) => {
  const { about, author, comment, title } = req.body;
  // console.log('re', re)
  try {
    // store suggestion
    const suggest = await suggestService.create({
      about,
      author,
      comment,
      title,
    });

    console.log('suggest', suggest);

    // make external API calls

    const tempObj = {
      author: {
        name: 'John DOE',
        email: 'johndoe@gmail.com',
        tag: ['tech'],
        phoneIndex: 123,
        phone: 123456789,
        civility: 'Mr',
        age: 27,
      },
      title: 'A new feature in Js you should learn',
      description: 'lorem ipsum dolor sit amet. Et consectur!',
    };

    const client = createDirectus('https://contacts.chillo.fr')
      .with(rest())
      .with(staticToken('7PtBsA6bKcvsFcIX0cJdMIW7WIVMsKlu'));

    console.log('client', client.url.toString());
    client
      .request(createItem('contact', tempObj))
      .then(res => {
        console.log('res', res);
      })
      .catch(err => {
        console.log('err', err.errors[0].extensions);
      });

    // send mail to confirm recption
    // first configure mailingOptions Obj
    const mailOptions = {
      to: author.email,
      subject: 'Nous avons bien reçu votre suggestion de contenu. Merci!',
      text: `
      <html>
        <style>
          header > h1 {
            font-size: 16px;
          }
        
          body {
            font-size: 14px;
          }
        
          main > p {
            display: grid;
          }
          a {
            text-decoration : none
          }
        </style>
        <body>
        <header>
          <h1>Bonjour 👋, Je suis Achille de <a href="chillo.tech" _target="blank">chillo.tech</a></h1>
          <p>Nous venons de recevoir votre suggestion de contenu: je vous en remercie.</p>
        </header>
        <p>Nous allons l'analyser et l'intégrer rapidement dans la liste des tutoriels à réaliser.</p>
        <p>Pour toute question ou suggestion n'hésitez pas à nous contacter.</p>

        <main>
          <div>
            <p>Bien à vous,</p>
            <p>Achille MBOUGUENG,</p>
            <p>Fondateur de <a href="chillo.tech" _target="blank">chillo.tech</a></p>
            <a href="tel:+33761705745" >+33 7 6170 57 45</a>
            <a href="https://www.youtube.com/channel/UC1fetPjPtTcUZWfiQpebf0Q>youtube</a>
            <a href="https://www.linkedin.com/company/86905161/admin/feed/posts/>LinkedIn</a> 
            <a href="https://www.facebook.com/profile.php?id=100084306755977" >facebook</a>
          </div>
        </main>
        </body>
      </html>
      `,
    };
    // the send the mail

    console.log('mailingOptions', mailOptions);

    mailingService.send(mailOptions);

    const mailingOptions2 = {
      to: 'contact@chillo.tech',
      subject: 'Nouvelle suggestion de contenu!',
      text: `
      <html>
        <body>
          <h1>${suggest.author?.name} vient de suggerer un contenu</h1>
          <p>Titre ${suggest.title}</p>
        </body>
      </html>
      `,
    };

    mailingService.send(mailingOptions2);

    res.json(suggest);
  } catch (e) {
    console.log('e', e);
    res.json({ msg: 'something went wrong' });
  }
};

const suggestController = {
  makeSuggestion,
};

export default suggestController;
