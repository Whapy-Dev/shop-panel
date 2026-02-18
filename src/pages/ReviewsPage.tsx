import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMyShop } from '@/hooks/useShop';
import { useShopReviews } from '@/hooks/useReviews';

export default function ReviewsPage() {
  const { data: shop, isLoading: shopLoading } = useMyShop();
  const { data: reviews, isLoading: reviewsLoading } = useShopReviews(shop?.id);

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Primero debes crear tu tienda</p>
        </Card>
      </div>
    );
  }

  if (reviewsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Extract data from the API response
  const reviewsList = reviews?.data || [];
  const totalReviews = reviews?.total || 0;
  const averageRating = reviews?.averageRating || 0;

  // Use backend-provided rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews?.ratingDistribution?.[star] || 0,
  }));

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reseñas</h1>
        <p className="text-muted-foreground">
          Calificaciones y comentarios de tus clientes
        </p>
      </div>

      {/* Rating Summary Card */}
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="mb-2">{renderStars(Math.round(averageRating), 'lg')}</div>
            <p className="text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm font-medium w-8">{star}★</span>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{
                      width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aún no tienes reseñas. Tus clientes podrán dejar comentarios después de sus compras.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewsList.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{review.user?.name || 'Cliente anónimo'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge variant={review.rating >= 4 ? 'default' : review.rating >= 3 ? 'secondary' : 'destructive'}>
                  {renderStars(review.rating)}
                </Badge>
              </div>
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
