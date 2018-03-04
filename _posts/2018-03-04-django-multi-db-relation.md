---
title: Django 다중 데이터베이스에서의 ForeignKey
tags:
  - python
  - django
---

Django는 같은 프로젝트 내에서 여러 개의 데이터베이스를 사용할 수 있도록 **데이터베이스 라우팅** 기능을 제공한다. 모델 종류 등 내가 설정한 조건에 따라 사용할 데이터베이스를 명시해줄 수 있는 기능이다. [(DOC)](https://docs.djangoproject.com/en/2.0/topics/db/multi-db/) 다만, 서로 다른 데이터베이스에 있는 테이블 사이의 관계를 지원하지 않는다. 기본적으로 참조 무결성이 훼손될 수 있는 구조이기 때문이다.

그러나 프로젝트 구현을 하던 중 참조 무결성을 희생하더라도 서로 다른 데이터베이스에 저장되는 두 모델 사이에 `ForeignKey`와 같은 관계를 지정해야 하는 상황이 충분히 생길 수 있다. Django에서 관련 기능을 마땅히 지원하지 않기 때문에 적용이 조금 난감할 수 있다. 나 또한 이를 해결하기 위해 여러가지 트릭을 시도해보았고, 그 과정을 본 포스트를 통해 기록하고자 한다.

* TOC
{:toc}

## 기본 세팅

간단한 도서 관리 프로젝트를 만들어보자. 단, 책을 쓴 작가(사람) 데이터는 다른 프로젝트에서도 공유할 수 있는 공용 데이터베이스에 저장된다고 가정한다.

### 작업 환경

- Python 3.6.2
- Django 2.0.2

### 다중 데이터베이스 설정

`django-admin startproject`를 통해 기본 프로젝트를 세팅하고 `settings.py`에 아래와 같이 데이터베이스를 두 개 설정하자.

```python
# django_multi_db_relation.settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'default.sqlite3'),
    },
    'common': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'common.sqlite3'),
    },
}
```

`default` 데이터베이스는 `Book` 모델이 저장되는 곳, `common` 모델은 다른 프로젝트와 공유하는 `Author` 모델이 저장되는 곳이 된다.

### 모델 정의

이제 간단하게 `python manage.py startapp`을 이용해서 `person`, `book` 앱을 각각 생성하고 아래처럼 모델을 작성한다.

```python
# person.models
from django.db import models

class Person(models.Model):
    name = models.CharField(max_length=20)
```

```python
# book.models
from django.db import models
from person.models import Person

class Book(models.Model):
    title = models.CharField(max_length=20)
    author = models.ForeignKey(Person, on_delete=models.CASCADE)
```

그리고 `settings.py`에 두 앱을 추가해준다.

```python
# django_multi_db_relation.settings
INSTALLED_APPS = [
    ...
    'person',
    'book',
]
```

이 상태만으로는 Django는 `default` 데이터베이스를 사용하며, 이외의 데이터베이스를 특정한 상황에 사용하게끔 전역적으로 만들어주기 위해서는 커스텀 데이터베이스 라우터를 구현해야 한다.

### 데이터베이스 라우터 구현

`Person` 모델은 `common` 데이터베이스에, `book` 모델은 `default` 데이터베이스에 저장되게 만들기 위해 데이터베이스 라우터를 구현해야 한다. 그 전에 `Person` 모델에 대응되는 테이블을 `common` 데이터베이스에 생성시켜야 한다.

```bash
$ python manage.py makemigrations person
$ python manage.py migrate person --database=common
```

이후 아래처럼 간단한 데이터베이스 라우터를 만든다.

```python
# django_multi_db_relation.database.routers
class DefaultRouter:
    def db_for_read(self, model, **hints):
        return 'common' if model._meta.app_label == 'person' else 'default'

    def db_for_write(self, model, **hints):
        return 'common' if model._meta.app_label == 'person' else 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return app_label != 'person'
```

그리고 `settings.py`에 이 데이터베이스 라우터를 활성화한다.

```python
DATABASE_ROUTERS = ['django_multi_db_relation.database.routers.DefaultRouter']
```

마지막으로 `book` 모델을 비롯한 나머지 프로젝트 관련 앱들을 마이그레이션 시킨다.

```bash
$ python manage.py makemigrations book
$ python manage.py migrate
```

`db_for_read()`와 `db_for_write()`는 어떤 데이터베이스에 데이터를 읽고 쓸 것인지 정의한다. 이 경우 모델이 속한 앱 이름이 `person`인 경우 `common` 데이터베이스를, 나머지 경우 `default` 데이터베이스를 사용하게끔 설정하였다.

`allow_relation()`은 두 모델 인스턴스 사이의 관계 설정이 가능한지 여부를 체크할 때 호출되는 메서드이다. 예를 들어 이것이 `False`로 설정되어 있으면 `book.author = person` 구문은 에러가 나게 된다. 이 메서드는 단순히 validation 측면에서만 동작하며, 다중 데이터베이스를 사용할 때 릴레이션을 할당하지 못하도록 막는 역할을 한다. 물론 Django의 이러한 제재를 우회하고자 하는 우리 목적과는 전혀 맞지 않는 기능으로, 당연히 `True`를 설정하고 넘어간다.

`allow_migrate()`는 `python manage.py migrate` 명령을 내릴 때 실제로 데이터베이스에 마이그레이션을 수행할 것인지 여부를 정의한다. Django는 데이터베이스 내에 `django_migrations`라는 테이블을 갖고 있고, 여기에 각 앱의 `migrations` 디렉터리 내 마이그레이션 파일들 중 이미 데이터베이스에 적용된 파일들을 저장한다. 그래서 마이그레이션 명령을 하게 되면 이 테이블을 참고하여 적용되지 않은 마이그레이션 작업만 수행하게 되는 것이다.

`allow_migrate()`가 `False`로 설정되어 있으면 해당 마이그레이션 작업은 실제로 수행되지 않으며 `django_migrations`에는 수행되었다고 표기된다.

> 앱 추가 - `person` 마이그레이션 - DB 라우터 추가 - 나머지 마이그레이션 순서로 작업이 이뤄지는 것이 중요하다.
>
> `person` 앱은 사실 다른 `common` 프로젝트에서 구현되었고 관리되고 있다고 가정하면, 하위 프로젝트인 '도서 관리 프로젝트'에서 `common` 데이터베이스를 마음대로 수정하면 안 될 것이다. 따라서 `common` 데이터베이스에 `person` 모델 테이블을 생성하되 `deault` 데이터베이스에는 이와 관련된 테이블을 생성하지 않게 하기 위해 위의 순서로 진행하였다.

### 테스트

여기까지 완료했으면 `python manage.py shell`을 실행하여 간단한 테스트를 해보자.

```python
>>> from person.models import *
>>> Person.objects.all()
<QuerySet []>
>>> from book.models import *
>>> Book.objects.all()
<QuerySet []>
```

잘 작동한다!

```python
>>> person = Person.objects.create(name='hangpark')
>>> Person.objects.first().name
'hangpark'
```

`Person` 객체 생성도 문제없이 이뤄진다. 이때 `Person` 데이터는 위에서 활성화한 `DefaultRouter`에 의해 `common` 데이터베이스에 저장됨을 유의하자.

```python
>>> book = Book.objects.create(title='a book', author=person)
Traceback (most recent call last):
    ...
sqlite3.OperationalError: no such table: main.person_person
```

그런데 방금 생성한 `Person`의 `Book` 객체를 저장하려고 하니 `main.person_person`, 즉 `Person`에 대응되는 테이블이 데이터베이스에 존재하지 않는다는 에러가 발생한다. 단순한 다중 데이터베이스 설정만으로 서로 다른 두 데이터베이스 사이의 외래키 설정이 되지 않는 것을 알 수 있다.

### 디버깅

한번 `Book` 생성 시 일어나는 쿼리를 확인해보자.

```python
>>> from pprint import pprint
>>> from django.db import connections
>>> pprint([e['sql'] for e in connections['default'].queries])
['BEGIN',
 'INSERT INTO "book_book" ("title", "author_id") VALUES (\'a book\', 1)']
```

그리고 `default.sqlite3`에 정의된 `book_book` 테이블 생성 쿼리는 아래와 같다.

```sql
CREATE TABLE "book_book" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" varchar(20) NOT NULL,
  "author_id" integer NOT NULL
    REFERENCES "person_person" ("id")
    DEFERRABLE INITIALLY DEFERRED
)
```

`default`에는 `person_person` 테이블이 존재하지 않지만 `book_book` 테이블에서 `author_id`가 `person_person` 테이블의 `id` 컬럼을 참조하고 있다. 이 제약조건에 걸려 `INSERT` 쿼리에서 오류가 발생되는 것이다.

다시 한 번 강조하지만, Django는 다중 데이터베이스 사이의 참조관계에 대한 지원을 전혀 하지 않고 있고 따라서 `ForeignKey`가 있으면 당연히 동일한 데이터베이스인 것으로 판단한다. 이제 이 문제를 여러 가지 접근 방식으로 해결해보도록 하자.

## 접근-1: IntegerField

다중 데이터베이스에서 참조관계를 사용하고자 할 때 참조 무결성 희생을 감안한다면 테이블에 설정된 참조관계 제약조건을 없애는 작업이 필요하다. 가장 기본적으로는 Django에서 `ForeignKey`가 아닌 단순 `IntegerField`를 사용하는 것이다.

`Book` 모델을 아래와 같이 수정하자.

```python
# book.models
class Book(models.Model):
    title = models.CharField(max_length=20)
    author_id = models.IntegerField()
    
    @property
    def author(self):
      return Person.objects.get(id=self.author_id)
```

이후 `default.sqlite3` 파일을 삭제 후 마이그레이션 작업을 다시 거치면 `book_book` 테이블 정의가 바뀐다.

```sql
CREATE TABLE "book_book" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" varchar(20) NOT NULL,
  "author_id" integer NOT NULL
)
```

참조관계가 사라진 것이다. 그러나 평상과 같이 `book.author` 처럼 접근할 수 있도록 하기 위해 `Book` 모델 내에 `author` 프로퍼티를 정의해 직접 `Person` 데이터를 가져오도록 하였다. 이 경우 `Book` 데이터 생성 시 `author` 대신 `author_id`를 넣어줘야 함을 기억하자.

```python
>>> from person.models import Person
>>> from book.models import Book
>>> person = Person.objects.first()
>>> book = Book.objects.create(title='a book', author=person)
Traceback (most recent call last):
    ...
TypeError: 'author' is an invalid keyword argument for this function
>>> book = Book.objects.create(title='a book', author_id=person.id)
>>> Book.objects.first().author.name
'hangpark'
```

### Setter 설정

`Book` 인스턴스 생성 시 `author` 속성을 통해 작가를 설정할 수 있게 하기 위해 간단히 setter를 정의할 수 있을 것이다.

```python
# book.models
class Book(models.Model):
    title = models.CharField(max_length=20)
    author_id = models.IntegerField()
    
    @property
    def author(self):
        return Person.objects.get(id=self.author_id)

    @author.setter
    def author(self, person):
        self.author_id = person.id
```

```python
>>> book = Book.objects.create(title='a book', author=person)
>>> Book.objects.first().author.name
'hangpark'
```

### Cache 설정

매번 작가를 참조할 때마다 쿼리를 날려 얻어내는 건 비효율적이기 때문에 동일 `Book` 인스턴스 내에서 `author`를 받아오기 위한 쿼리를 한 번만 수행하도록 해보자. Django의 `cached_property`를 이용하면 쉽게 할 수 있는데, setter까지 연결하기 위해서는 아래와 같이 구현하면 된다.

```python
# book.models
from django.utils.functional import cached_property

class Book(models.Model):
    title = models.CharField(max_length=20)
    author_id = models.IntegerField()
    
    @cached_property
    def _author(self):
        return Person.objects.get(id=self.author_id)
    
    @property
    def author(self):
        return self._author

    @author.setter
    def author(self, person):
        del self.__dict__['_author']
        self.author_id = person.id
```

물론 새롭게 descriptor를 구현해줘도 되지만, 위 방법이 별 다른 고민 없이 구현할 수 있는 최선이라고 생각한다. 캐싱이 되는지 확인하기 위해 쿼리를 살펴보자.

```python
>>> from django.db import connections
>>> len(connections['common'].queries)
0
>>> book = Book.objects.first()
>>> book.author.name
'hangpark'
>>> len(connections['common'].queries)
1
>>> book.author.name
'hangpark'
>>> len(connections['common'].queries)
1
>>> book.author = Person.objects.create(name='new person')
>>> len(connections['common'].queries)
3
>>> book.author.name
'new person'
>>> len(connections['common'].queries)
4
```

잘 작동한다!

물론 이 방식은 전혀 concrete하지 않는 방식이다.

## 접근-2: ForeignKey 제약조건 비활성화

위 방식은 기존 `ForeignKey` 구조와 너무 다른 API를 사용한다. 유지보수도 어렵고 쿼리셋과의 인테그레이션도 힘들다. 이를 보완하기 위해 데이터베이스 상 참조관계 제약조건을 없애는 전략을 변경해보자.

`ForeignKey` 파라미터에는 `db_constraint` 옵션이 있다. 기본값은 `True`인데 이를 `False`로 비활성화 하면 데이터베이스에서 참조 무결성을 체크하지 않는다. 개인적으로 `IntegerField`를 이용하는 이전 방식보다 이 방식이 훨씬 더 깔끔하다고 생각한다.

`Book` 모델을 아래와 같이 수정하자.

```python
# book.models
class Book(models.Model):
    title = models.CharField(max_length=20)
    author = models.ForeignKey(Person, on_delete=models.DO_NOTHING, db_constraint=False)
```

이후 `default.sqlite3` 파일을 삭제 후 마이그레이션 작업을 다시 거치면 `book_book` 테이블 정의가 바뀐다.

```sql
CREATE TABLE "book_book" (
  "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
  "title" varchar(20) NOT NULL,
  "author_id" integer NOT NULL
)
```

이전 방식과 테이블 정의가 일치함을 알 수 있다. 체크해보면 위 방식에서 테스트했던 모든 케이스가 정상적으로 동작함을 알 수 있다!

훨씬 간단해진 것이다. 사실 이전 방식은 `db_constraint` 옵션이 지원되는지 알지 못했을 때 시도했던 방식이다.

> 물론 Django가 `db_constraint` 옵션을 제공하는 것은 다중 데이터베이스의 `ForeignKey`를 염두했기 때문은 전혀 아니다. 공식 문서에서는 **레거시 데이터 처리**랑 **데이터베이스 샤딩**을 언급하고 있다.

여기서 cascade 옵션으로 `DO_NOTHING`을 설정한 것은

1. `person.delete()`를 하였을 때 `common` 데이터베이스에 `book_book` 테이블이 없기 때문
2. `person.delete(using='default')`로 삭제하더라도 `default` 데이터베이스에 `person_person` 테이블이 없기 때문
3. 어차피 도서 관리 프로젝트에서는 `Person` 데이터를 읽기만 하는 것이 구조상 맞기 때문

정도의 이유로 정당화할 수 있을 것이다. 물론 참조 무결성이 훼손되므로 에러 처리를 잘 해주어야 한다.

### 쿼리 최적화

REST API를 만든다고 가정하자. 간단하게 딕셔너리를 반환하는 메서드를 `Book` 모델에 추가해보자.

```python
class Book(models.Model):
    ...
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': {
                'id': self.author.id,
                'name': self.author.name,
            },
        }
```

그리고 데이터베이스에 기본 픽스쳐를 추가하자.

```python
>>> Book.objects.all().delete()
>>> Person.objects.all().delete()
>>> persons = Person.objects.bulk_create(
...     [Person(id=i, name='person-{}'.format(i)) for i in range(1, 3)])
>>> Book.objects.bulk_create(
...     [Book(id=i, title='book-{}'.format(i), author=persons[i%2]) for i in range(1, 11)])
```

작가 두 명에 책 열 권을 추가했다. 한번 확인해보자.

```python
>>> from pprint import pprint
>>> pprint([b.to_dict() for b in Book.objects.all()])
[{'author': {'id': 2, 'name': 'person-2'}, 'id': 1, 'title': 'book-1'},
 {'author': {'id': 1, 'name': 'person-1'}, 'id': 2, 'title': 'book-2'},
 {'author': {'id': 2, 'name': 'person-2'}, 'id': 3, 'title': 'book-3'},
 {'author': {'id': 1, 'name': 'person-1'}, 'id': 4, 'title': 'book-4'},
 {'author': {'id': 2, 'name': 'person-2'}, 'id': 5, 'title': 'book-5'},
 {'author': {'id': 1, 'name': 'person-1'}, 'id': 6, 'title': 'book-6'},
 {'author': {'id': 2, 'name': 'person-2'}, 'id': 7, 'title': 'book-7'},
 {'author': {'id': 1, 'name': 'person-1'}, 'id': 8, 'title': 'book-8'},
 {'author': {'id': 2, 'name': 'person-2'}, 'id': 9, 'title': 'book-9'},
 {'author': {'id': 1, 'name': 'person-1'}, 'id': 10, 'title': 'book-10'}]
```

잘 등록되었다!

이 결과는 책 리스트를 반환하는 API에서 사용하게 될 것이다. 그럼 이 API를 호출하는 데 드는 쿼리 수는 몇 개일까?

```python
>>> from django.db import connections, reset_queries
>>> def count_queries(queryset):
...     reset_queries()
...     [b.to_dict() for b in queryset]
...     return {db: len(connections[db].queries) for db in connections.databases.keys()}
... 
>>> count_queries(Book.objects.all())
{'default': 1, 'common': 10}
```

분석해보면 API에서 작가에 대한 nested 표현을 얻기 위해 `book.author`를 총 열 번 호출하는데, 이 때마다 `common` 데이터베이스에 쿼리가 보내진다. 작가는 총 두 명 뿐인데 같은 사람을 다섯 번씩이나 중복으로 얻고 있는 것이다. 사실상 11번이 아니라 2번이면 될 것을 말이다.

이런 쿼리 줄이기 위해 Django 쿼리셋에서는 `select_related()`를 제공한다. 그러나 여기서 `select_related()`를 사용하면 당연히 작동하지 않는다. 이 메서드는 쿼리에 조인을 걸어 연관 필드를 함께 받아오는 기능을 하기 때문에 존재하지 않는 테이블과는 조인을 할 수 없는 것이다.

```python
>>> Book.objects.select_related('author')
Traceback (most recent call last):
    ...
django.db.utils.OperationalError: no such table: person_person
```

효율적인 nested REST API를 작성하기 위해 필수적인 `select_related()`를 사용하기 위해 어떻게 하는 것이 좋을까. 두 가지 방법을 직접 구현해보았다.

**(1) select_related() 오버라이딩**

첫번째 방법은 `QuerySet` 내 `select_related()`를 오버라이딩하는 방식으로, 코어 수준의 로직을 재정의하는 과정이 필요하지만 평소 사용하는 `select_related()` 구문을 동일하게 사용할 수 있다는 장점이 있다.

`BookQueryset`을 아래처럼 정의하고 이를 `Book` 모델에서 사용할 수 있도록 하자.

```python
# book.models
class BookQuerySet(models.QuerySet):
    def __init__(self, *args, **kwargs):
        """
        쿼리셋 생성 시 Person 모델을 받아올지, Person 상위 모델도 받아올지
        저장하는 변수를 초기화한다.
        """
        self._related_fields_to_select = []
        self._select_related_author = False
        super().__init__(*args, **kwargs)

    def _clone(self):
        """
        쿼리셋 체이닝 시 외부 DB 모델 받아오는 옵션 변수를 복사하여 기존
        인스턴스의 값과 일치하게 만들어준다.
        """
        c = super()._clone()
        c._select_related_author = self._select_related_author
        c._related_fields_to_select = self._related_fields_to_select[:]
        return c

    def _fetch_all(self):
        """
        Lazy 로딩이 실제로 이뤄지는 부분.

        페칭을 마치기 직전에 `select_related()` 설정에 따라 한 번의 쿼리로
        Person 인스턴스들을 받아와 각각의 Book 인스턴스에 설정한다.

        기존 페칭 로직은 Person 인스턴스를 받아오지 않아 Book 인스턴스에서
        연관 author를 호출하게 되면 데이터베이스 참조가 이뤄져 비효율적이다.
        """
        super()._fetch_all()

        # author를 받아올 필요가 없을 때
        if not self._select_related_author:
            return

        # 페칭이 완료된 Book 리스트에서 연관된 author 아이디만 추출
        author_ids = [book.author_id for book in self._result_cache]
        if author_ids:
            # author 아이디 목록에 포함되는 Person 인스턴스를 DB에서 받아옴
            # 이때 Person의 연관필드들도 설정값에 따라 함께 불러올 수 있음
            queryset = Person.objects.filter(
                id__in=author_ids
            )
            if self._related_fields_to_select:
                queryset = queryset.select_related(
                    *self._related_fields_to_select
                )
            authors = {author.id: author for author in queryset}

            # 각각의 Book 인스턴스의 author 필드에 Person 인스턴스를 설정
            for book in self._result_cache:
                book.author = authors[book.author_id]

    def select_related(self, *fields):
        """
        Person 및 Person 연관 모델들에 관련된 `select_related()` 기능을
        지원하기 위한 메서드.
        """
        if self._fields is not None:
            raise TypeError("Cannot call select_related() after .values() or .values_list()")

        targets = ['author', 'author__company']
        filtered_fields = []
        for f in fields:
            if f in targets:
                self._select_related_author = True
                if f[8:]:
                    self._related_fields_to_select.append(f[8:]) # author__ 길이
            else:
                filtered_fields.append(f)
                
        if not filtered_fields:
            return self._chain()
        
        return super().select_related(*filtered_fields)


class Book(models.Model):
    ...
    objects = models.Manager.from_queryset(queryset_class=BookQuerySet)()
```

이후 테스트를 진행하여 잘 작동하는 것을 확인하자!

```python
>>> count_queries(Book.objects.all())
{'default': 1, 'common': 20}
>>> count_queries(Book.objects.select_related('author'))
{'default': 1, 'common': 3}
>>> count_queries(Book.objects.select_related('author__company'))
{'default': 1, 'common': 1}
```

이때 `Person` 모델에 `common` 데이터베이스에 있는 다른 모델(예를 들어 `Company`)을 향한 `ForeignKey`(예를 들어 `company`)를 추가하였다.

**(2) prefetch_related() 사용**

공식문서에서는 `prefetch_related()`를 N:N 관계나 1:N 관계에서 이용하는 부분에 초점을 맞추고 있지만, 기본 원리를 따르면 N:1이나 1:1 관계에서도 사용할 수가 있다는 것을 알아냈다!

그래서 다른 데이터베이스에 존재하는 테이블을 미리 얻어오기 위하여 `select_related()` 대신 `prefetch_related()`를 사용할 수 있다.

```python
>>> count_queries(Book.objects.prefetch_related('author'))
{'default': 1, 'common': 1}
```

쿼리 수가 `O(n)`에서 `O(1)`로 획기적으로 줄은 것을 알 수 있다!

만약 `Person` 모델에 `common` 데이터베이스에 있는 다른 모델(예를 들어 `Company`)을 향한 `ForeignKey`(예를 들어 `company`)가 존재할 경우 기존 21번에서 3번으로 줄어든다. 3번 중 1번은 기존처럼 두 작가를 얻는 쿼리, 2번은 두 명의 작가에 대한 `company`를 각각 얻는 쿼리이다.

```python
>>> count_queries(Book.objects.all())
{'default': 1, 'common': 20}
>>> count_queries(Book.objects.prefetch_related('author'))
{'default': 1, 'common': 3}
```

이 두 작가의 `company`를 한 쿼리로 얻고 싶으면 `Prefetch` 오브젝트 내에서 `select_related()`를 사용하면 된다.

```python
>>> from django.db.models import Prefetch
>>> qs = Book.objects.prefetch_related(
...     Prefetch('author', queryset=Person.objects.select_related('company')))
>>> count_queries(qs)
{'default': 1, 'common': 1}
```

다시 `O(1)`로 돌아왔다! 조금 복잡하지만, `prefetch_related()`를 사용해서 다중 데이터베이스 접근을 최소화할 수 있는 쿼리를 자유롭게 만들 수 있다.

**(3) select_related()에서 prefetch_related() 사용**

(1)과 (2) 방식을 혼합하여 (1)의 복잡한 구조 대신 딱 `select_related()`만 오버라이딩할 수도 있다.

```python
class BookQuerySet(models.QuerySet):
    def select_related(self, *fields):
        """
        Person 및 Person 연관 모델들에 관련된 `select_related()` 기능을
        지원하기 위한 메서드.
        """
        if self._fields is not None:
            raise TypeError("Cannot call select_related() after .values() or .values_list()")

        targets = ['author', 'author__company']
        filtered_fields = []
        include_fetch = False
        fetched_fields = []
        for f in fields:
            if f in targets:
                include_fetch = True
                if f[8:]:
                    fetched_fields.append(f[8:])
            else:
                filtered_fields.append(f)
        obj = self._chain() if not filtered_fields else super().select_related(*filtered_fields)
        if include_fetch:
            qs = Person.objects.all()
            if fetched_fields:
                qs = qs.select_related(*fetched_fields)
            obj = obj.prefetch_related(models.Prefetch('author', queryset=qs))
        return obj
```

마지막 테스트!

```python
>>> count_queries(Book.objects.all())
{'default': 1, 'common': 20}
>>> count_queries(Book.objects.select_related('author'))
{'default': 1, 'common': 3}
>>> count_queries(Book.objects.select_related('author__company'))
{'default': 1, 'common': 1}
```

## 이외의 방법

이외에도 https://code.i-harness.com/en/q/53d1f9 이곳에 나와있는 접근법 역시 존재한다. (테스트를 진행해보진 않았다.)

## 정리

다중 데이터베이스를 사용할 때 다른 데이터베이스 내 테이블을 향하는 `ForeignKey`를 설정하는 방법과 쿼리셋 최적화 전략을 알아보았다. 물론 두 가지 접근 모두 쿼리셋 내 대부분의 메서드를 자유롭게 사용할 수 없지만 가장 필요하다고 생각되는 `select_related()`를 사용할 수 있도록 커스터마이징을 해보았다.

다중 데이터베이스를 운용한다는 것부터가 쿼리셋을 짤 때 단일 데이터베이스의 단순함을 그대로 사용하겠다는 욕심을 버린다는 걸 전제로 한다. 더군다나 Django가 다중 데이터베이스 간 관계를 지원하지 않기 때문에라도 많은 커스터마이징이 필요할 것이다.

본 포스트를 기반으로 여러분만의 쿼리 커스터마이징을 잘 구현해낼 수 있으면 좋겠다.
