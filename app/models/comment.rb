class Comment < ApplicationRecord

  validates :content, presence: true, length: { in: 0..5000 }

  belongs_to :user
  has_many :comments

end
