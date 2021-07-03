import * as React from "react"
import Layout from "../components/layout"

const AboutPage = ({ location, pageContext }) => {
  const page = {
    headline: 'About Me',
    description: 'About Me',
  }
  return (
    <Layout location={location} metadata={pageContext.metadata} page={page}>
      <div id="resume">
        <section id="tb">
          <hr/>
          <p className="lead text-center">About Me</p>
        </section>
        <section>
          <div className="title col-12">Technical Skills</div>
          <p><small>★ experienced, ★★ knowledgeable, ★★★ strong</small></p>
          <p className="lead">Django <small>★★★</small></p>
          <ul>
            <li>Django REST Framework, Django Channels, JWT, Jinja2</li>
            <li>queryset optimization <small>(including overriding default queryset methods and caching)</small>,
              multi-db managing
            </li>
            <li>knowledge about descriptors and metaclasses of python and its applications on Django models</li>
            <li>available to understand and analyse Django source codes</li>
          </ul>
          <p className="lead">Golang <small>★★★</small></p>
          <ul>
            <li>API Server implementation</li>
          </ul>
          <p className="lead">Spring Framework <small>★★</small></p>
          <ul>
            <li>Spring Boot, JPA <small>(Hibernate)</small>, jUnit5</li>
          </ul>
          <p className="lead">Vue.js <small>★★★</small></p>
          <ul>
            <li>ES6, Vuex, Webpack customization, grpc-web</li>
          </ul>
          <p className="lead">DevOps & Etc.</p>
          <ul>
            <li>Git <small>(git flow, github, GitOps)</small>, Docker, Vim, Nginx, Azure</li>
            <li>MSA <small>(Kubernetes, Istio, Envoy, gRPC)</small>, AWS, Terraform, Vault, Helm</li>
            <li>RDBMS, RabbitMQ, DynamoDB, Redis, Couchbase</li>
          </ul>
        </section>
        <section>
          <div className="title col-12">Work Experience</div>
          <p className="lead"><a href="http://www.devsisters.com/" target="_blank" rel="noopener noreferrer">Devsisters Corp.</a> <small>(2018.05
            - present)</small></p>
          <p className="small">SW Engineer in DevPlay cell</p>
          <ul>
            <li>Develop DevPlay, a mobile game platform.</li>
          </ul>
          <p className="lead"><a href="https://ancle.kr/" target="_blank" rel="noopener noreferrer">Ancle, Inc.</a> <small>(2017.07 -
            2018.05)</small></p>
          <p className="small">SW Developer in Service Development Dept</p>
          <ul>
            <li>Developed backend of several web sites with Spring framework.</li>
            <li>Managed relocating operating server to Azure computing instance and introduced Docker based server
              managing process.
            </li>
            <li>Developed in-company HRM system by using Django.</li>
          </ul>
          <p className="lead"><a href="https://biz.talkyou.in/" target="_blank" rel="noopener noreferrer">TalkYou</a> <small>(2017.12 -
            2019.07)</small></p>
          <p className="small">Full-stack developer and service maintainer</p>
          <ul>
            <li>Developed RESTful API server by using DRF.</li>
            <li>Developed web app by using Vue.js.</li>
          </ul>
          <p className="lead">Startup and Concentrated Programming Camp <small>(2017.06 - 2017.07)</small></p>
          <p className="small">Participant in which hosted by KAIST and BonAngels, Inc.</p>
          <p className="lead">One Two Three, Inc. <small>(2015.07 - 2015.08)</small></p>
          <p className="small">Internship provided by KAIST CUOP Program <small>(Company-University Cooperation)</small>
          </p>
        </section>
        <section>
          <div className="title col-12">Education</div>
          <p className="lead"><a href="http://www.kaist.ac.kr/" target="_blank" rel="noopener noreferrer">KAIST</a></p>
          <p><small>2013 - present, undergraduate</small></p>
          <p><a href="https://cs.kaist.ac.kr/" target="_blank" rel="noopener noreferrer">School of Computing</a> <small>(Computer Science)</small>,<br/><a
            href="http://mathsci.kaist.ac.kr/" target="_blank" rel="noopener noreferrer">Dept. of Mathematical Sciences</a> <small>(Double
            major)</small></p>
          <p className="lead"><a href="https://ksa.hs.kr/" target="_blank" rel="noopener noreferrer">Korea Science Academy of KAIST</a></p>
          <p><small>2010 - 2012, highschool</small></p>
        </section>
        <section>
          <div className="title col-12">Side Projects</div>
          <p className="lead">KAIST USC Website <small>(2016.05 - 2018)</small></p>
          <p className="small">Full-stack developer (excluding web design) @ <a href="https://student.kaist.ac.kr"
                                                                                target="_blank" rel="noopener noreferrer">https://student.kaist.ac.kr</a>
          </p>
          <ul>
            <li>Website of KAIST Undergraduate Student Council developed by Django.</li>
            <li>Ported KAIST SSO implementation of Django to Python3 and applied it.</li>
            <li>I18n fully supported for international students.</li>
          </ul>
          <p className="lead">Nationwide Students' Vote Competition on 19th Presidential
            Election <small>(2017.05)</small></p>
          <p className="small">Full-stack developer (excluding web design) @ <a href="https://univote.kr"
                                                                                target="_blank" rel="noopener noreferrer">https://univote.kr</a>
          </p>
          <p className="small">Korean: 제19대 대선 전국 대학생 투표대항전</p>
          <ul>
            <li>Proof shot uploading platform which shows voting ranking of each university to encourage students to
              participate on the 19th Korean presidential election.
            </li>
            <li>DRF and Angular2 are used.</li>
            <li>About 2,600 students participated in total. <small><a href="http://news.joins.com/article/21540856"
                                                                      target="_blank" rel="noopener noreferrer">(http://news.joins.com/article/21540856)</a></small>
            </li>
          </ul>
          <p className="lead">Open Source Contributions</p>
          <ul>
            <li>[Improvement] Webpack Doc <small>(webpack/webpack.js.org)</small></li>
            <li>[L10N] Webpack Korea <small>(webpack-korea/webpack.js.org)</small></li>
            <li>[Documentation] Django REST Framework <small>(encode/django-rest-framework)</small></li>
            <li>[Bugfix] Apache Common Math <small>(apache/commons-math)</small></li>
            <li>[L10N] Linux Mint Applets <small>(linuxmint/cinnamon-spices-applets)</small></li>
            <li>[Improvement] KAIST SSOv3 in Django for Python3 <small>(hangpark/DJANGO4KAIST)</small></li>
          </ul>
          <p className="lead">Other Projects</p>
          <p>See <a href="https://github.com/hangpark/" target="_blank" rel="noopener noreferrer">https://github.com/hangpark</a> for more
            information.</p>
        </section>
        <section>
          <div className="title col-12">Languages</div>
          <ul>
            <li>English - Intermediate</li>
            <li>Korean - Advanced</li>
          </ul>
        </section>
        <section>
          <div className="title col-12">Interests</div>
          <ul>
            <li>Solving social problems with IT technologies</li>
            <li>Dev talks and discussions</li>
            <li>Learning good architectures and designs</li>
            <li>Automation of development process for more efficient work flow</li>
          </ul>
        </section>
      </div>
    </Layout>
  )
}

export default AboutPage
