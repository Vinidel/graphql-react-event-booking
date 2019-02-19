const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const {buildSchema} = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');

const PORT = process.env.PORT || 3000
const app = express();
const events = [];

app.use(bodyParser.json());
app.use('/graphql', graphqlHttp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find().exec()
        .then((r) =>{ 
          console.log(r)
        return r
      });
    },
    createEvent: (args) => {
      const e = new Event({
        _id: mongoose.Types.ObjectId(),
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: args.eventInput.price,
        date: args.eventInput.date
      });

      return e.save()
        .then((r) => {
          console.log(r);
          return {...r._doc};
        })
        .catch((e) => {
          console.log(e);
          throw e;
        })
    }
  },
  graphiql: true
}))
app.get('/', (req, res) => {
  res.send('Hello world');
})

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-dv9uf.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`)
  .then(() => {
    return app.listen(PORT, () => {
      console.log(`App started on ${PORT}`)
    });    
  }).catch(e => {
    console.log('There was an error connecting to DB', e)
  })
