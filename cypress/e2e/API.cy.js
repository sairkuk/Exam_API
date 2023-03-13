/// <reference types = "cypress"/>
import { faker } from '@faker-js/faker';
import posts from '../fixtures/posts.json'
import dataForUser from '../fixtures/dataForUser.json'


posts.userId = faker.random.numeric(),
posts.id = faker.datatype.uuid()
posts.title = faker.random.word()
posts.body = faker.random.words()
posts.entity = faker.random.words()
dataForUser.email = faker.internet.email()
dataForUser.password = faker.internet.password()


describe('Api suite', () => {

  it('Done - Get all posts.', () => {
    cy.log('Get all posts.')
    cy.request('GET', '/posts').then(response => {
      console.log(response.allRequestResponses);
      cy.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`);
      expect(response.status).to.be.equal(200)
      expect(response.statusText).to.be.equal('OK')
      expect(response.isOkStatusCode).to.be.true;
      expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8')
    })
  })

  it('Done - Get only first 10 posts.', () => {
    cy.log('Get only first 10 posts. "for"')
    cy.request('GET', '/posts?_limit=10').then(response => {
      console.log(response);
      cy.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`);
      expect(response.status).to.be.equal(200)
      expect(response.statusText).to.be.equal('OK')
      expect(response.isOkStatusCode).to.be.true;
      expect(response.body.length).to.equal(10);

    })
  })

  it('Done - Get posts with id = 55 and id = 60', () => {
    cy.log('Get posts with id = 55 and id = 60.')
    cy.request('GET', '/posts?id=55&id=60').then(response => {
      console.log(response);
      cy.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`);
      expect(response.status).to.be.equal(200)
      expect(response.statusText).to.be.equal('OK')
      expect(response.isOkStatusCode).to.be.true;
      expect(response.body[0]).to.have.property('id', 55)
      expect(response.body[1]).to.have.property('id', 60)
    })
  })

  it('Done - Create a post', () => {
    cy.log('Create a post')
    cy.request({
      method: 'POST',
      url: '/664/posts',
      failOnStatusCode: false,
      posts
    }).then(response => {
      console.log(response);
      expect(response.status).to.be.equal(401)
      expect(response.statusText).to.be.equal('Unauthorized')
    })
  })

  describe('Create post with adding access token in header.', () => {
   let postId
    let accessToken;
    it('Registration',  () => {
      cy.request({
        method: 'POST',
        url: '/register',
        body: {
          email: dataForUser.email,
          password: dataForUser.password
        }
      }).then(response => {
        console.log(response)
        expect(response.status).to.be.equal(201)
        expect(response.statusText).to.be.equal('Created')
      })
    })
    it('Login', () => {
      cy.request({
        method: 'POST',
        url: '/login',
        body: {
          email: dataForUser.email,
          password: dataForUser.password
        }
      }).then(response => {
        accessToken = response.body.accessToken;
        console.log(accessToken)
        expect(response.status).to.be.equal(200)
        expect(response.statusText).to.be.equal('OK')
      })
    })
    it('Create post with adding access token in header.', async () => {
      cy.request({
        method: 'POST',
        url: '/664/posts',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body:
        {
          userId: posts.userId,
          id: faker.datatype.uuid(),
          title: posts.title,
          body: posts.body,
          entity: posts.entity
        },
      }).then(response => {
        postId = response.body.id;
        console.log(postId)
        console.log(response)
        expect(response.status).to.be.equal(201)
        expect(response.statusText).to.be.equal('Created')
      })
      // cy.request({
      //   method: 'GET',
      //   url: `/664/posts/${postId}`,
      // }).then(response => {
      //   expect(response.status).to.be.equal(200)
      //   expect(response.statusText).to.be.equal('OK')
      // })
    })
  })

  it('Done - Create post entity and verify that the entity is created', () => {
    cy.log('Create post entity and verify that the entity is created')
    cy.request({
      method: 'POST',
      url: '/posts',
      body: {
        userId: posts.userId,
        id: posts.id,
        title: posts.title,
        body: posts.body,
        entity: posts.entity
      },
    }).then(response => {
      console.log(response.allRequestResponses);
      cy.log(`Request body: ${response.allRequestResponses[0]["Request Body"]}`);
      expect(response.status).to.be.equal(201)
      expect(response.statusText).to.be.equal('Created')
      expect(response.isOkStatusCode).to.be.true;
      expect(response.body.entity).to.have.contain(posts.entity)
    })
  })

  it('Done - Update non-existing entity', () => {
    cy.log('Update non-existing entity')
    cy.request({
      method: 'PUT',
      url: '/posts',
      failOnStatusCode: false,
      body: {
        never: 'dffdfdfdff'
      }
    }).then(response => {
      console.log(response);
      expect(response.status).to.be.equal(404)
      expect(response.statusText).to.be.equal('Not Found')
    })
  })

  describe('Done - Create post entity and update the created entity', () => {
    let id;

    it('Create post entity. ', () => {
      cy.log('Create post entity. ')
      cy.request({
        method: 'POST',
        url: '/posts',
        posts,
      }).then(response => {
        console.log(response);
        expect(response.status).to.be.equal(201)
        expect(response.statusText).to.be.equal('Created')
        expect(response.isOkStatusCode).to.be.true;
        id = response.body.id;
      })
    })

    it('Update the created entity. ', () => {
      cy.log('Update the created entity. ')
      cy.request({
        method: 'PUT',
        url: `/posts/${id}`,
        body: {
          entity: 'dsvfdvdfvdf'
        }
      }).then(response => {
        console.log(response);
        expect(response.status).to.be.equal(200)
        expect(response.body.entity).to.have.contain('dsvfdvdfvdf')
        expect(response.status).to.be.equal(200)
        expect(response.statusText).to.be.equal('OK')
      })
    })
  })

  it('Done - Delete non-existing post entity. ', () => {
    cy.log('Delete non-existing post entity. ')
    const id = 234567564;

    cy.request({
      method: 'DELETE',
      url: `/posts/${id}`,
      failOnStatusCode: false,
    }).then(response => {
      console.log(response);
      expect(response.status).to.be.equal(404)
      expect(response.statusText).to.be.equal('Not Found')
    })
  })

  describe('Done -Create post entity, update the created entity, and delete the entity', () => {
    let id;

    it('Create post entity. ', () => {
      cy.log('Create post entity. ')
      cy.request({
        method: 'POST',
        url: '/posts',
        posts,
      }).then(response => {
        console.log(response);
        expect(response.status).to.be.equal(201)
        expect(response.statusText).to.be.equal('Created')
        expect(response.isOkStatusCode).to.be.true;
        id = response.body.id;
        console.log(id);
      })
    })

    it('Update the created entity. ', () => {
      cy.log('Update the created entity. ')
      cy.request({
        method: 'PUT',
        url: `/posts/${id}`,
        body: {
          entity: 'dsvfdvdfvdf'
        }
      }).then(response => {
        console.log(response);
        expect(response.status).to.be.equal(200)
        expect(response.body.entity).to.have.contain('dsvfdvdfvdf')
        expect(response.status).to.be.equal(200)
        expect(response.statusText).to.be.equal('OK')
      })
    })
    it('Delete the entity', () => {
      cy.log('Delete non-existing post entity. ')
      cy.request({
        method: 'DELETE',
        url: `/posts/${id}`
      }).then(response => {
        console.log(response.body.entity);
        expect(response.status).to.be.equal(200)
        expect(response.statusText).to.be.equal('OK')
      })
      cy.request({
        method: 'GET',
        url: `/posts/${id}`,
        failOnStatusCode: false,
      }).then(response => {
        expect(response.status).to.be.equal(404)
        expect(response.statusText).to.be.equal('Not Found')
      })

    })
  })
























})