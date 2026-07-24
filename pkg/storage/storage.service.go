package storage

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"path/filepath"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/yonsina94/go-user-manager/internal/config"
	"github.com/yonsina94/go-user-manager/internal/logging"
)

type StorageService struct {
	client *minio.Client
	bucket string
	logger *slog.Logger
}

func NewStorageService(lf *logging.LoggerFactory) (*StorageService, error) {

	logger := lf.CreateLogger(logging.ComponentDetails{
		Name:        "StorageService",
		Type:        "Service",
		Description: "Service for manage the S3 bucket",
	})

	logger.Info("Opening the S3 connection...")

	logger.Debug("Using this detailed credentials for connect", slog.GroupAttrs("credentials", slog.String("access_key", config.AppConfig.S3AccessKey), slog.String("secret_key", config.AppConfig.S3SecretKey)), slog.Bool("is_ssl", config.AppConfig.S3UseSSL))

	client, err := minio.New(config.AppConfig.S3Endpoint, &minio.Options{
		Creds: credentials.NewStaticV4(
			config.AppConfig.S3AccessKey,
			config.AppConfig.S3SecretKey,
			"",
		),
		Secure: config.AppConfig.S3UseSSL,
	})

	if err != nil {
		logger.Error("There's occur an error trying to connect to S3", slog.Any("error", err))
		return nil, err
	}

	logger.Info("Connection to S3 opened")

	return &StorageService{
		client: client,
		bucket: config.AppConfig.S3Bucket,
		logger: logger,
	}, nil
}

func (s *StorageService) UploadAvatar(ctx context.Context, userID uint, fileName string, reader io.Reader, size int64, contentType string) (avatarUrl string, err error) {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return "", err
	}

	if !exists {
		err = s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{})
		if err != nil {
			return "", err
		}
	}

	// Configurar política de lectura pública para que las imágenes sean accesibles en el navegador
	policy := fmt.Sprintf(`{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}`, s.bucket)
	_ = s.client.SetBucketPolicy(ctx, s.bucket, policy)

	ext := filepath.Ext(fileName)
	objectName := fmt.Sprintf("avatars/user_%d_%d%s", userID, time.Now().Unix(), ext)

	_, err = s.client.PutObject(ctx, s.bucket, objectName, reader, size, minio.PutObjectOptions{ContentType: contentType})

	if err != nil {
		return "", fmt.Errorf("there's occur a error when uploading the avatar image: %w", err)
	}

	avatarUrl = fmt.Sprintf("%s/%s/%s", config.AppConfig.S3PublicURL, s.bucket, objectName)

	return
}
