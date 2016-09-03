class Post < ApplicationRecord

  validates :content, presence: true, length: { in: 0..10000 }

  belongs_to :user
  has_many :comments, dependent: :destroy

  def find_comments # проходит по всем комментам поста и рекурсивно возвращает массив json деревьев комментов
    @comments = []
    self.comments.each do |comment|
      @comments << next_comment(comment)
    end
    @comments
  end

  private

  def next_comment(comment)
    cms = comment.comments
    if cms.empty?
      cmnt = comment.as_json
      cmnt['user'] = comment.user.serialize
      cmnt
    else
       cmnt = comment.as_json
       cmnt['user'] = comment.user.serialize
       cmnt['comments'] = []
       cms.each do |c|
         cmnt['comments'] << next_comment(c).as_json
       end
       cmnt
    end
  end

end
