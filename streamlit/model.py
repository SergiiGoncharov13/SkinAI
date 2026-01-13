import timm
import torch.nn as nn


class NevusModel(nn.Module):
    def __init__(self, backbone='efficientnet_b0', num_classes=3):
        super(NevusModel, self).__init__()

        # Use timm to create the backbone model (e.g., EfficientNet)
        # We set num_classes=0 to get the features before the classifier head
        self.backbone_net = timm.create_model(backbone, pretrained=True, num_classes=0)

        # Get the number of output features from the backbone
        backbone_output_dim = self.backbone_net.num_features

        # Define a shared fully connected layer(s) for processing the features
        self.shared_fc = nn.Sequential(
            nn.Linear(backbone_output_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3)
        )

        # Define the final classification head for num_classes
        self.classification_head = nn.Linear(512, num_classes)

    def forward(self, x):
        # Pass the input image through the backbone to get features
        features = self.backbone_net(x)

        # Pass the features through the shared FC layer
        features = self.shared_fc(features)

        # Get the final logits from the classification head
        logits = self.classification_head(features)

        return logits
